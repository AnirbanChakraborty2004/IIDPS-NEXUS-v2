import logging
import pyttsx3
import speech_recognition as sr
from .nlp_query_handler import NLPQueryHandler

logger = logging.getLogger(__name__)

class ServerVoiceAssistant:
    """
    A server-side Voice Assistant for testing without the frontend.
    Note: In production, the React frontend handles STT/TTS via Web Speech API,
    and simply passes the text to the NLPQueryHandler via WebSockets.
    """
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.nlp = NLPQueryHandler()
        try:
            self.engine = pyttsx3.init()
            voices = self.engine.getProperty('voices')
            self.engine.setProperty('voice', voices[0].id) # Select default voice
            self.engine.setProperty('rate', 170)
        except Exception as e:
            logger.error(f"Failed to initialize pyttsx3: {e}")
            self.engine = None

    def speak(self, text: str):
        if self.engine:
            logger.info(f"[J.A.R.V.I.S]: {text}")
            self.engine.say(text)
            self.engine.runAndWait()
        else:
            logger.warning(f"[J.A.R.V.I.S Text-Only]: {text}")

    def process_text_command(self, text: str) -> str:
        """Processes text (from API/WebSocket) and returns the spoken response string."""
        response_text = self.nlp.parse_and_execute(text)
        return response_text
