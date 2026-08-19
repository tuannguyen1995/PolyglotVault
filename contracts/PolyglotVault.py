# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass
import json

@allow_storage
@dataclass
class Task:
    publisher: str
    translator: str
    escrow_amount: bigint
    translator_stake: bigint
    status: str            # OPEN, IN_PROGRESS, AWAITING_PAYOUT, NEEDS_REVISION, ESCALATED, DISPUTED, CLOSED
    media_url: str         # Source video transcript / content URL
    subtitle_url: str      # Submitted SRT / VTT subtitle file URL
    target_lang: str       # Target language (e.g. "English to Vietnamese")
    guidelines: str        # Style guidelines and tone constraints
    blacklist_words: str   # Forbidden terms or machine-translation artifacts
    verdict: str           # APPROVED, PARTIAL, REFUND, ESCALATE
    reason: str
    confidence: bigint
    attempts: bigint
    payout_ready_at: bigint
    disputed_at: bigint

class Contract(gl.Contract):
    tasks: TreeMap[str, Task]
    task_ids: DynArray[str]
    platform_admin: str

    def __init__(self):
        # GenVM automatically allocates TreeMap & DynArray
        self.platform_admin = str(gl.message.sender_address).lower()

    def _get_current_timestamp(self) -> bigint:
        """Derive trusted timestamp strictly from execution context (gl.message_raw)."""
        dt_raw = gl.message_raw.get("datetime", None) if isinstance(gl.message_raw, dict) else None
        if not dt_raw:
            raise UserError("Trusted execution timestamp missing from transaction context")
        try:
            from datetime import datetime
            dt = datetime.fromisoformat(str(dt_raw).replace("Z", "+00:00"))
            ts = int(dt.timestamp())
            if ts > 0:
                return bigint(ts)
        except Exception as e:
            raise UserError(f"Failed to parse trusted execution timestamp: {str(e)}")
        raise UserError("Invalid execution timestamp in transaction context")

    def _parse_llm_json(self, text) -> dict:
        """Robust parser handling raw JSON or markdown code fences."""
        if isinstance(text, dict):
            return text
        if hasattr(text, "__dict__"):
            return text.__dict__
        t = str(text).strip()
        if t.startswith("```json"):
            t = t[7:]
        elif t.startswith("```"):
            t = t[3:]
        if t.endswith("```"):
            t = t[:-3]
        try:
            return json.loads(t.strip())
        except Exception as e:
            return {"verdict": "ESCALATE", "confidence": 0, "reason": f"JSON parse failure: {str(e)}"}

    @gl.public.write.payable
    def create_task(
        self,
        task_id: str,
        media_url: str,
        target_lang: str,
        guidelines: str,
        blacklist_words: str
    ) -> None:
        amount = gl.message.value
        if amount <= bigint(0):
            raise UserError("Escrow reward must be greater than 0")
        if task_id in self.tasks:
            raise UserError("Task ID already exists")
        if not media_url.startswith("http"):
            raise UserError("Valid HTTP/HTTPS media URL required")

        self.task_ids.append(task_id)
        self.tasks[task_id] = Task(
            publisher=str(gl.message.sender_address).lower(),
            translator="0x0000000000000000000000000000000000000000",
            escrow_amount=amount,
            translator_stake=bigint(0),
            status="OPEN",
            media_url=media_url.strip(),
            subtitle_url="",
            target_lang=target_lang.strip(),
            guidelines=guidelines.strip(),
            blacklist_words=blacklist_words.strip(),
            verdict="NONE",
            reason="Awaiting translator acceptance",
            confidence=bigint(0),
            attempts=bigint(0),
            payout_ready_at=bigint(0),
            disputed_at=bigint(0)
        )

    @gl.public.write.payable
    def accept_task(self, task_id: str) -> None:
        """Translator accepts task by depositing mandatory 20% stake."""
        if task_id not in self.tasks:
            raise UserError("Task not found")
        task = self.tasks[task_id]
        if task.status != "OPEN":
            raise UserError("Task is not in OPEN status")
        if str(gl.message.sender_address).lower() == task.publisher:
            raise UserError("Publisher cannot translate their own task")

        stake = gl.message.value
        min_stake = task.escrow_amount // bigint(5)  # 20% minimum stake
        if stake < min_stake or stake <= bigint(0):
            raise UserError(f"Insufficient stake: Minimum 20% required ({min_stake})")

        task.translator = str(gl.message.sender_address).lower()
        task.translator_stake = stake
        task.status = "IN_PROGRESS"
        self.tasks[task_id] = task

    @gl.public.write
    def submit_subtitles(self, task_id: str, subtitle_url: str) -> None:
        """Translator submits localized subtitle file URL."""
        if task_id not in self.tasks:
            raise UserError("Task not found")
        task = self.tasks[task_id]
        if str(gl.message.sender_address).lower() != task.translator:
            raise UserError("Only the assigned translator can submit deliverables")
        if task.status not in ["IN_PROGRESS", "NEEDS_REVISION"]:
            raise UserError("Task is not in a submittable state")
        if not subtitle_url.startswith("http"):
            raise UserError("Valid HTTP/HTTPS subtitle URL required")

        task.subtitle_url = subtitle_url.strip()
        task.attempts += bigint(1)
        self.tasks[task_id] = task

        media_str = task.media_url
        sub_str = task.subtitle_url
        lang_str = task.target_lang
        guide_str = task.guidelines
        black_str = task.blacklist_words

        def leader_fn():
            # 1. Anti-Rugpull Check: Source video / transcript URL
            try:
                m_res = gl.nondet.web.render(media_str, mode="text")
                m_text = str(m_res)
                if any(err in m_text[:400].lower() for err in ["404 not found", "error 404", "not found"]):
                    return {"verdict": "ESCALATE", "confidence": 100, "reason": "Original media URL is dead/404; escrow preserved to protect translator."}
            except Exception as e:
                return {"verdict": "ESCALATE", "confidence": 100, "reason": f"Media fetch failed: {str(e)}"}

            # 2. Anti-Spam Check: Subtitle file deliverable
            try:
                s_res = gl.nondet.web.render(sub_str, mode="text")
                s_text = str(s_res)
                if any(err in s_text[:400].lower() for err in ["404 not found", "error 404", "not found"]):
                    return {"verdict": "REFUND", "confidence": 100, "reason": "Subtitle file URL is dead/404 or empty."}
            except Exception as e:
                return {"verdict": "REFUND", "confidence": 100, "reason": f"Subtitle fetch failed: {str(e)}"}

            prompt = f"""
You are a Senior Localization Adjudicator & Polyglot Quality Judge on GenLayer.
Evaluate the submitted subtitle file against the original media context.

ORIGINAL MEDIA CONTENT / TRANSCRIPT:
{m_text[:2500]}

REQUIRED TARGET LANGUAGE:
{lang_str}

STYLE & CULTURAL GUIDELINES:
{guide_str}

FORBIDDEN / BLACKLISTED WORDS:
{black_str}

SUBMITTED SUBTITLE DELIVERABLE (SRT/VTT/TEXT):
{s_text[:2500]}

DECISION CRITERIA:
- APPROVED: Accurate timing, high translation fidelity, cultural nuance preserved, zero blacklist words.
- PARTIAL: Minor typos or slightly awkward phrasing, but fully legible and usable.
- REFUND: Machine-translation hallucinations, wrong language, severe timing drift, or used blacklist terms.
- ESCALATE: Evidence is unreadable, ambiguous, or requires human linguistic arbitration.

Respond ONLY with valid JSON:
{{"verdict": "APPROVED|PARTIAL|REFUND|ESCALATE", "confidence": 0-100, "reason": "Technical justification"}}
"""
            res = gl.nondet.exec_prompt(prompt, response_format="json")
            if isinstance(res, dict):
                return res
            return self._parse_llm_json(str(res))

        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return):
                return False
            leader_data = leader_res.calldata if hasattr(leader_res, "calldata") else leader_res
            if not isinstance(leader_data, dict):
                leader_data = self._parse_llm_json(str(leader_data))

            mine_data = leader_fn()

            v_lead = str(leader_data.get("verdict", "")).upper().strip()
            v_mine = str(mine_data.get("verdict", "")).upper().strip()
            c_lead = int(leader_data.get("confidence", 0))
            c_mine = int(mine_data.get("confidence", 0))

            eff_lead = "ESCALATE" if c_lead < 65 else v_lead
            eff_mine = "ESCALATE" if c_mine < 65 else v_mine
            return eff_lead == eff_mine

        result = gl.vm.run_nondet(leader_fn, validator_fn)
        if not isinstance(result, dict):
            result = self._parse_llm_json(str(result))

        verdict = str(result.get("verdict", "ESCALATE")).upper()
        try:
            conf = int(result.get("confidence", 0))
        except Exception:
            conf = 0
        reason = str(result.get("reason", "No reason provided"))

        if conf < 65:
            verdict = "ESCALATE"
            reason = f"[Low Confidence {conf}% < 65%] " + reason

        task.verdict = verdict
        task.reason = reason
        task.confidence = bigint(conf)

        if verdict in ["APPROVED", "PARTIAL"]:
            task.status = "AWAITING_PAYOUT"
            task.payout_ready_at = self._get_current_timestamp() + bigint(86400)  # 24h cooling-off
        elif verdict == "REFUND":
            if task.attempts < bigint(2):
                task.status = "NEEDS_REVISION"
            else:
                # Two consecutive failures -> Slash translator stake to publisher
                task.status = "CLOSED"
                total_refund = task.escrow_amount + task.translator_stake
                task.escrow_amount = bigint(0)
                task.translator_stake = bigint(0)
                gl.get_contract_at(Address(task.publisher)).emit_transfer(value=u256(total_refund))
        else:
            task.status = "ESCALATED"

        self.tasks[task_id] = task

    @gl.public.write
    def finalize_payout(self, task_id: str) -> None:
        """Disburses funds after the 24-hour cooling-off window."""
        if task_id not in self.tasks:
            raise UserError("Task not found")
        task = self.tasks[task_id]
        if task.status != "AWAITING_PAYOUT":
            raise UserError("Task is not awaiting payout")

        caller = str(gl.message.sender_address).lower()
        if caller != task.publisher and caller != task.translator:
            raise UserError("Unauthorized caller")

        now = self._get_current_timestamp()
        if now < task.payout_ready_at:
            raise UserError("24-hour cooling-off period has not elapsed yet")

        escrow = task.escrow_amount
        stake = task.translator_stake
        task.status = "CLOSED"
        task.escrow_amount = bigint(0)
        task.translator_stake = bigint(0)

        if task.verdict == "APPROVED":
            gl.get_contract_at(Address(task.translator)).emit_transfer(value=u256(escrow + stake))
        elif task.verdict == "PARTIAL":
            half = escrow // bigint(2)
            rem = escrow - half
            gl.get_contract_at(Address(task.translator)).emit_transfer(value=u256(half + stake))
            gl.get_contract_at(Address(task.publisher)).emit_transfer(value=u256(rem))

        self.tasks[task_id] = task

    @gl.public.write
    def resolve_escalation(self, task_id: str, action: str) -> None:
        """Arbitrates escalated tasks. Publishers may only voluntarily concede (RELEASE)."""
        if task_id not in self.tasks:
            raise UserError("Task not found")
        task = self.tasks[task_id]
        if task.status not in ["ESCALATED", "DISPUTED"]:
            raise UserError("Task is not in ESCALATED or DISPUTED status")

        caller = str(gl.message.sender_address).lower()
        act = action.upper().strip()

        if caller == task.publisher and caller != self.platform_admin:
            if act != "RELEASE":
                raise UserError("Publishers can only voluntarily RELEASE funds. Only admin can REFUND or SPLIT.")

        if caller != self.platform_admin and caller != task.publisher:
            raise UserError("Unauthorized caller")

        escrow = task.escrow_amount
        stake = task.translator_stake
        task.status = "CLOSED"
        task.escrow_amount = bigint(0)
        task.translator_stake = bigint(0)

        if act == "RELEASE":
            gl.get_contract_at(Address(task.translator)).emit_transfer(value=u256(escrow + stake))
        elif act == "REFUND":
            gl.get_contract_at(Address(task.publisher)).emit_transfer(value=u256(escrow + stake))
        elif act == "SPLIT":
            half = escrow // bigint(2)
            rem = escrow - half
            gl.get_contract_at(Address(task.translator)).emit_transfer(value=u256(half + stake))
            gl.get_contract_at(Address(task.publisher)).emit_transfer(value=u256(rem))
        else:
            raise UserError("Invalid action. Must be RELEASE, REFUND, or SPLIT")

        self.tasks[task_id] = task

    @gl.public.view
    def get_all_tasks(self) -> str:
        res = []
        for tid in self.task_ids:
            if tid in self.tasks:
                t = self.tasks[tid]
                res.append({
                    "id": tid,
                    "publisher": t.publisher,
                    "translator": t.translator,
                    "escrow_amount": str(t.escrow_amount),
                    "translator_stake": str(t.translator_stake),
                    "status": t.status,
                    "media_url": t.media_url,
                    "subtitle_url": t.subtitle_url,
                    "target_lang": t.target_lang,
                    "guidelines": t.guidelines,
                    "blacklist_words": t.blacklist_words,
                    "verdict": t.verdict,
                    "reason": t.reason,
                    "confidence": str(t.confidence),
                    "attempts": str(t.attempts),
                    "payout_ready_at": str(t.payout_ready_at),
                    "disputed_at": str(t.disputed_at)
                })
        return json.dumps(res)
