"""
CiPress - AI Response Cache
Provides fast in-memory and persistent caching for AI responses
to minimize API quota consumption, prevent 429 rate limits, and accelerate response times.
"""

import hashlib
import json
import time
import os
import logging

logger = logging.getLogger(__name__)

class AICache:
    def __init__(self, ttl_seconds: int = 86400, max_entries: int = 500):
        self.ttl = ttl_seconds
        self.max_entries = max_entries
        self._cache = {}  # key -> { 'result': str, 'source': str, 'model': str, 'timestamp': float }

    def _hash_key(self, text: str, action: str, custom_prompt: str = None, target_tone: str = None, target_lang: str = None, context: str = None) -> str:
        payload = {
            "text": (text or "").strip().lower(),
            "action": (action or "").strip().lower(),
            "custom_prompt": (custom_prompt or "").strip().lower(),
            "target_tone": (target_tone or "").strip().lower(),
            "target_lang": (target_lang or "").strip().lower(),
            "context": (context or "").strip().lower()
        }
        serialized = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

    def get(self, text: str, action: str, custom_prompt: str = None, target_tone: str = None, target_lang: str = None, context: str = None):
        key = self._hash_key(text, action, custom_prompt, target_tone, target_lang, context)
        entry = self._cache.get(key)
        if not entry:
            return None

        # Check expiration
        if time.time() - entry['timestamp'] > self.ttl:
            del self._cache[key]
            return None

        logger.info(f"AI Cache Hit for action='{action}' (saved tokens & quota)")
        return {
            "result": entry['result'],
            "source": entry.get('source', 'gemini'),
            "model": entry.get('model', 'gemini-2.5-flash'),
            "cached": True
        }

    def set(self, text: str, action: str, result: str, source: str = 'gemini', model: str = None, custom_prompt: str = None, target_tone: str = None, target_lang: str = None, context: str = None):
        if not result:
            return

        # Simple eviction if max size reached
        if len(self._cache) >= self.max_entries:
            # Remove oldest 20%
            sorted_keys = sorted(self._cache.keys(), key=lambda k: self._cache[k]['timestamp'])
            for old_key in sorted_keys[:max(1, len(sorted_keys) // 5)]:
                self._cache.pop(old_key, None)

        key = self._hash_key(text, action, custom_prompt, target_tone, target_lang, context)
        self._cache[key] = {
            "result": result,
            "source": source,
            "model": model or "gemini-2.5-flash",
            "timestamp": time.time()
        }

# Global singleton cache instance
ai_cache = AICache()
