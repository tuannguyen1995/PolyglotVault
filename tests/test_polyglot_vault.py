import sys
import os
import unittest
from unittest.mock import MagicMock

class MockAddress(str): pass
class MockBigInt(int): pass
class MockUserError(Exception): pass

class MockReturn:
    def __init__(self, calldata):
        self.calldata = calldata

class MockContractStub:
    def __init__(self, address, tracker):
        self.address = address
        self.tracker = tracker

    def emit_transfer(self, value):
        self.tracker.append({"to": self.address, "value": value})

class MockGL:
    class Contract:
        def __init__(self):
            self.tasks = {}
            self.task_ids = []
            self.platform_admin = "0xadmin"

    class public:
        @staticmethod
        def view(fn): return fn
        @staticmethod
        def write(fn): return fn

    class message:
        value = MockBigInt(0)
        sender_address = MockAddress("0xPublisher")

    class nondet:
        class web:
            @staticmethod
            def render(url, mode="text"): pass
        @staticmethod
        def exec_prompt(prompt, response_format="json"): pass

    class vm:
        Return = MockReturn
        @staticmethod
        def run_nondet(leader_fn, validator_fn):
            res = leader_fn()
            ret = MockReturn(calldata=res)
            if not validator_fn(ret):
                raise MockUserError("Consensus Disagreement")
            return res

    def __init__(self):
        self.transfers = []
        self.message_raw = {"datetime": "2026-08-19T00:00:00+00:00"}

    def get_contract_at(self, address):
        return MockContractStub(address, self.transfers)

MockGL.public.write.payable = lambda fn: fn

mock_mod = MagicMock()
mock_mod.gl = MockGL()
mock_mod.allow_storage = lambda cls: cls
mock_mod.Address = MockAddress
mock_mod.bigint = MockBigInt
mock_mod.u256 = MockBigInt
mock_mod.UserError = MockUserError
mock_mod.TreeMap = dict
mock_mod.DynArray = list

sys.modules["genlayer"] = mock_mod
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "contracts")))
import PolyglotVault as contract_module

class TestPolyglotVaultAdversarialSuite(unittest.TestCase):
    def setUp(self):
        self.gl = mock_mod.gl
        self.gl.transfers = []
        self.gl.message_raw = {"datetime": "2026-08-19T00:00:00+00:00"}
        self.admin = MockAddress("0xadmin")
        self.pub = MockAddress("0xpublisher")
        self.trans = MockAddress("0xtranslator")
        self.hacker = MockAddress("0xhacker")

        self.gl.message.sender_address = self.admin
        self.contract = contract_module.Contract()
        self.contract.tasks = {}
        self.contract.task_ids = []
        self.contract.platform_admin = self.admin.lower()

        # Task setup: 1000 GEN escrow
        self.gl.message.sender_address = self.pub
        self.gl.message.value = MockBigInt(1000)
        self.tid = "task_asmr_cooking_01"
        self.contract.create_task(
            self.tid,
            "https://youtube.com/watch?v=cooking_asmr",
            "English to Vietnamese",
            "Maintain soothing tone, precise culinary terms",
            "profanity, cheap, plastic"
        )

    def test_01_under_staking_reverts(self):
        """Stake < 20% must revert."""
        self.gl.message.sender_address = self.trans
        self.gl.message.value = MockBigInt(199)
        with self.assertRaises(MockUserError):
            self.contract.accept_task(self.tid)

    def test_02_cooling_off_blocks_early_payout(self):
        """Enforces 24-hour payout delay for both publisher and translator."""
        self.gl.message.sender_address = self.trans
        self.gl.message.value = MockBigInt(200)
        self.contract.accept_task(self.tid)

        self.gl.nondet.web.render = lambda url, mode="text": "Subtitles file verified."
        self.gl.nondet.exec_prompt = lambda p, response_format="json": {"verdict": "APPROVED", "confidence": 96, "reason": "Accurate localization"}

        self.contract.submit_subtitles(self.tid, "https://storage.com/subs.srt")
        self.assertEqual(self.contract.tasks[self.tid].status, "AWAITING_PAYOUT")

        # Attempt withdrawal at T+6h -> Reverts
        self.gl.message_raw = {"datetime": "2026-08-19T06:00:00+00:00"}
        with self.assertRaises(MockUserError):
            self.contract.finalize_payout(self.tid)

        # Successful withdrawal at T+24h01m -> Disburses 1200 (1000 escrow + 200 stake)
        self.gl.message_raw = {"datetime": "2026-08-20T00:01:00+00:00"}
        self.contract.finalize_payout(self.tid)
        self.assertEqual(self.contract.tasks[self.tid].status, "CLOSED")
        self.assertEqual(self.gl.transfers[0]["value"], 1200)

    def test_03_double_failure_slashes_stake(self):
        """Two failed submissions slashes translator's 20% stake to publisher."""
        self.gl.message.sender_address = self.trans
        self.gl.message.value = MockBigInt(200)
        self.contract.accept_task(self.tid)

        self.gl.nondet.web.render = lambda url, mode="text": "Machine-translated garbage"
        self.gl.nondet.exec_prompt = lambda p, response_format="json": {"verdict": "REFUND", "confidence": 99, "reason": "Hallucinated phrases"}

        # Attempt 1: revision required
        self.contract.submit_subtitles(self.tid, "https://storage.com/sub1.srt")
        self.assertEqual(self.contract.tasks[self.tid].status, "NEEDS_REVISION")

        # Attempt 2: slashed
        self.contract.submit_subtitles(self.tid, "https://storage.com/sub2.srt")
        self.assertEqual(self.contract.tasks[self.tid].status, "CLOSED")
        self.assertEqual(self.gl.transfers[0]["to"], self.pub)
        self.assertEqual(self.gl.transfers[0]["value"], 1200)

    def test_04_anti_tampering_404_escalates(self):
        """Missing/404 media URL forces ESCALATE to prevent publisher rug-pull."""
        self.gl.message.sender_address = self.trans
        self.gl.message.value = MockBigInt(200)
        self.contract.accept_task(self.tid)

        self.gl.nondet.web.render = lambda url, mode="text": "404 Not Found"
        self.contract.submit_subtitles(self.tid, "https://storage.com/subs.srt")
        self.assertEqual(self.contract.tasks[self.tid].status, "ESCALATED")

    def test_05_partial_verdict_splits_payout(self):
        """PARTIAL verdict returns stake + 50% reward to translator, and 50% reward to publisher."""
        self.gl.message.sender_address = self.trans
        self.gl.message.value = MockBigInt(200)
        self.contract.accept_task(self.tid)

        self.gl.nondet.web.render = lambda url, mode="text": "Subtitles with minor typos."
        self.gl.nondet.exec_prompt = lambda p, response_format="json": {"verdict": "PARTIAL", "confidence": 85, "reason": "Minor formatting issue"}

        self.contract.submit_subtitles(self.tid, "https://storage.com/subs.srt")
        self.assertEqual(self.contract.tasks[self.tid].status, "AWAITING_PAYOUT")

        self.gl.message_raw = {"datetime": "2026-08-20T00:01:00+00:00"}
        self.contract.finalize_payout(self.tid)
        self.assertEqual(self.contract.tasks[self.tid].status, "CLOSED")
        # Translator gets 500 (half) + 200 (stake) = 700
        self.assertEqual(self.gl.transfers[0]["to"], self.trans)
        self.assertEqual(self.gl.transfers[0]["value"], 700)
        # Publisher gets 500
        self.assertEqual(self.gl.transfers[1]["to"], self.pub)
        self.assertEqual(self.gl.transfers[1]["value"], 500)

    def test_06_unauthorized_actions_revert(self):
        """Non-assigned translator cannot submit subtitles."""
        self.gl.message.sender_address = self.trans
        self.gl.message.value = MockBigInt(200)
        self.contract.accept_task(self.tid)

        self.gl.message.sender_address = self.hacker
        with self.assertRaises(MockUserError):
            self.contract.submit_subtitles(self.tid, "https://storage.com/hacker.srt")

if __name__ == "__main__":
    unittest.main(verbosity=2)
