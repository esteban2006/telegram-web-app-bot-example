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
            print ("->")
            pprint (parsed_data)
        except ValueError as err:
            return "invalid init data"
        if "hash" not in parsed_data:
            return "missing hash"

        hash_ = parsed_data.pop("hash")
        parsed_data.pop("update")
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

    print ("data received in validation function: ")
    pprint (init_data)

    
    # Ensure auth_date is within 5 seconds of the current time
    current_time_ms = int(time.time() * 1000)
    
    # Attempt to retrieve and convert auth_date to an integer
    try:
        auth_date = int(init_data["auth_date"]) * 1000  # Convert to ms if it's in seconds
    except ValueError:
        # Handle case where auth_date is not a valid integer
        return "Invalid auth_date provided."
    
    # print(f"Current time on server (ms): {current_time_ms}\nTime from user PC (ms): {auth_date}")
    
    # print ("init data")
    # pprint (init_data)

    # if abs(current_time_ms - auth_date) > 10000:  # 5000 milliseconds = 5 seconds
    #     return "Please make sure you are on a high-speed internet connection"

    # Prepare init_data by encoding each key-value pair appropriately
    encoded_data = {}
    for key, value in init_data.items():
        # Convert nested dictionaries to JSON strings without extra spaces
        if isinstance(value, dict):
            encoded_data[key] = json.dumps(value, separators=(",", ":"))
        else:
            encoded_data[key] = str(value)



    # Create a URL-encoded query string without additional spaces
    init_data_str = urllib.parse.urlencode(encoded_data, doseq=True)

    # Initialize WebAppAuth with a secret key
    v = WebAppAuth("7738287101:AAE-mgrdPlfyoYXntQxqgFdE3mC3NLAwOTs")
    
    # Validate the hash
    validation_result = v._validate(init_data_str)
    if isinstance(validation_result, str):
        # Handle error messages from _validate (like "invalid hash" or "missing hash")
        return validation_result
    
    return "Validation successful!"  # Or return validated data if needed



if __name__ == "__main__":
    # Test init_data dictionary
    init_data = {
    "query_id": "AAFPEON0AAAAAE8Q43SzP37a",
    "user": {
        "id": 1961037903,
        "first_name": "Esteban",
        "last_name": "Jandres",
        "username": "eggsteban_503",
        "language_code": "en",
        "allows_write_to_pm": True
    },
    "auth_date": "1731067683",
    "hash": "560d8b115cbdfaf31d1ed05fb57c2775ec6c68d5b8074d0c2749aa8d15676aeb",
    "update": "validate"
}

    # Run the function to verify
    print (f"Auth:  {validate_telegram_load(init_data)}")