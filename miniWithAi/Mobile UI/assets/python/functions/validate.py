import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from operator import itemgetter
from typing import Any
from urllib.parse import parse_qsl
import urllib.parse
from pprint import pprint


class WebAppAuth:
    def __init__(self, house: str) -> None:
        self._house = house
        self._secret_key = self._get_secret_key()

    def get_user_id(self, init_data: str) -> int:
        return int(json.loads(self._validate(init_data)["user"])["id"])

    def _get_secret_key(self) -> bytes:
        return hmac.new(
            key=b"WebAppData", msg=self._house.encode(), digestmod=hashlib.sha256
        ).digest()

    def _validate(self, init_data: str) -> dict[str, Any]:
        try:
            parsed_data = dict(parse_qsl(init_data, strict_parsing=True))
        except ValueError as err:
            return "invalid init data"
        if "hash" not in parsed_data:
            return "missing hash"

        hash_ = parsed_data.pop("hash")
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed_data.items(), key=itemgetter(0))
        )
        calculated_hash = hmac.new(
            key=self._secret_key,
            msg=data_check_string.encode(),
            digestmod=hashlib.sha256,
        ).hexdigest()
        if calculated_hash != hash_:
            return "invalid hash"

        return parsed_data


def validate_telegram_load(init_data):
    # Ensure auth_date is within 5 seconds of the current time
    current_time_ms = int(time.time())
    auth_date = int(init_data.get("auth_date", 0))

    print(1)

    if current_time_ms - auth_date > 5:
        return "Plese make sure you are in a high speed internet "

    print(2)

    # Prepare init_data by encoding each key-value pair appropriately
    encoded_data = {}

    for key, value in init_data.items():
        # Convert nested dictionaries to JSON strings without extra spaces
        if isinstance(value, dict):
            encoded_data[key] = json.dumps(value, separators=(",", ":"))
        else:
            encoded_data[key] = str(value)

    print(3)

    # Create a URL-encoded query string without additional spaces
    init_data_str = urllib.parse.urlencode(encoded_data, doseq=True)

    print(4)

    v = WebAppAuth("7738287101:AAE-mgrdPlfyoYXntQxqgFdE3mC3NLAwOTs")
    return v._validate(init_data_str)


if __name__ == "__main__":
    # Test init_data dictionary
    init_data = {
        "query_id": "AAFPEON0AAAAAE8Q43RNXS94",
        "user": {
            "id": 1961037903,
            "first_name": "Esteban",
            "last_name": "Jandres",
            "username": "eggsteban_503",
            "language_code": "en",
            "allows_write_to_pm": True,
        },
        "auth_date": "1730613767",  # Set auth_date to current time for testing
        "hash": "aeb71c1b5b197410726796430f5df2fbc295954dd132f965f8135aa2a8357622",
    }

    # Run the function to verify
    pprint(validate_telegram_load(init_data))
