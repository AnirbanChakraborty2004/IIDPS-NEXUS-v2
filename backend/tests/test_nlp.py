import unittest
from app.voice_assistant.nlp_query_handler import NLPQueryHandler

class TestNLPQueryHandler(unittest.TestCase):
    def setUp(self):
        self.nlp = NLPQueryHandler()

    def test_status_query(self):
        response = self.nlp.parse_and_execute("what is the threat level")
        self.assertIn("Low", response)
        
    def test_block_ip_query(self):
        # Even with an accent or extra words, it should find the IP
        response = self.nlp.parse_and_execute("please block the ip address 192.168.1.100 immediately")
        self.assertIn("Successfully blocked IP address 192.168.1.100", response)
        
    def test_stats_query(self):
        response = self.nlp.parse_and_execute("give me the system stats")
        self.assertIn("500 packets per second", response)
        
    def test_unknown_query(self):
        response = self.nlp.parse_and_execute("tell me a joke")
        self.assertIn("I'm sorry, I didn't understand", response)

if __name__ == '__main__':
    unittest.main()
