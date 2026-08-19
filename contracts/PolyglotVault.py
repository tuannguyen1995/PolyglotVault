# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
from dataclasses import dataclass
import json

class UserError(Exception):
    pass

@allow_storage
@dataclass
class Task:
    publisher: str
    translator: str
    escrow_amount: bigint
    translator_stake: bigint
    status: str
    media_url: str
    subtitle_url: str
    target_lang: str
    guidelines: str
    blacklist_words: str
    verdict: str
    reason: str
    confidence: bigint
    attempts: bigint
    payout_ready_at: bigint
    disputed_at: bigint

class PolyglotVault(gl.Contract):
    platform_admin: str
    tasks: TreeMap[str, Task]
    task_ids: DynArray[str]

    def __init__(self):
        self.platform_admin = str(gl.message.sender_address).lower()

    def _get_current_timestamp(self) -> bigint:
        return gl.vm.get_timestamp()

    def _parse_llm_json(self, response_str: str) -> dict:
        try:
            return json.loads(response_str)
        except Exception:
            clean_str = response_str.replace("```json", "").replace("```", "").strip()
            try:
                return json.loads(clean_str)
            except Exception:
                return {"verdict": "ESCALATE", "confidence": 0, "reason": "Failed to parse AI output."}

    @gl.public.write.payable
    def create_task(self, task_id: str, media_url: str, target_lang: str, guidelines: str, blacklist_words: str) -> None:
        if task_id in self.tasks:
            raise UserError(f"Task ID {task_id} already exists")
        
        escrow_amt = gl.message.value
        if escrow_amt <= bigint(0):
            raise UserError("Escrow bounty must be strictly positive")

        caller = str(gl.message.sender_address).lower()
        
        task = Task(
            publisher=caller,
            translator="0x0000000000000000000000000000000000000000",
            escrow_amount=escrow_amt,
            translator_stake=bigint(0),
            status="OPEN",
            media_url=media_url,
            subtitle_url="",
            target_lang=target_lang,
            guidelines=guidelines,
            blacklist_words=blacklist_words,
            verdict="NONE",
            reason="",
            confidence=bigint(0),
            attempts=bigint(0),
            payout_ready_at=bigint(0),
            disputed_at=bigint(0)
        )
        self.tasks[task_id] = task
        self.task_ids.append(task_id)

    @gl.public.write.payable
    def accept_task(self, task_id: str) -> None:
        if task_id not in self.tasks:
            raise UserError("Task not found")
        task = self.tasks[task_id]
        if task.status != "OPEN":
            raise UserError("Task is not OPEN")

        caller = str(gl.message.sender_address).lower()
        if caller == task.publisher:
            raise UserError("Publisher cannot accept their own task")

        min_stake = task.escrow_amount // bigint(5)
        if gl.message.value < min_stake:
            raise UserError(f"Insufficient stake. Required: 20% of escrow ({min_stake})")

        task.translator = caller
        task.translator_stake = gl.message.value
        task.status = "IN_PROGRESS"
        self.tasks[task_id] = task

    @gl.public.write
    def submit_deliverable(self, task_id: str, subtitle_url: str) -> None:
        if task_id not in self.tasks:
            raise UserError("Task not found")
        task = self.tasks[task_id]
        caller = str(gl.message.sender_address).lower()
        
        if caller != task.translator:
            raise UserError("Only the assigned translator can submit")
        if task.status not in ["IN_PROGRESS", "NEEDS_REVISION"]:
            raise UserError("Task is not ready for submission")

        task.subtitle_url = subtitle_url
        task.attempts += bigint(1)
        
        m_url = task.media_url
        s_url = task.subtitle_url
        lang_str = task.target_lang
        guide_str = task.guidelines
        black_str = task.blacklist_words

        def leader_fn() -> dict:
            try:
                m_text = gl.nondet.web_render(m_url)
                if any(err in m_text[:400].lower() for err in ["404 not found", "error 404", "not found"]):
                    return {"verdict": "ESCALATE", "confidence": 100, "reason": "Source media URL is dead/404. Manual arbitration required."}
            except Exception as e:
                return {"verdict": "ESCALATE", "confidence": 100, "reason": f"Media fetch failed: {str(e)}"}

            try:
                s_text = gl.nondet.web_render(s_url)
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
            task.payout_ready_at = self._get_current_timestamp() + bigint(86400)
        elif verdict == "REFUND":
            if task.attempts < bigint(2):
                task.status = "NEEDS_REVISION"
            else:
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
