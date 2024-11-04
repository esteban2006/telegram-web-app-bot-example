import requests
import json
from pprint import pprint

url = "https://670a74b300b03e3e7001.appwrite.global/v1/functions/670a74b100353c94b684/executions"  # Corrected URL
headers = {"Content-Type": "application/json"}

data = {
    "update": "validate",
    "init_data": {
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
    },
}

# Use the `json` parameter to send the payload
response = requests.post(url, json=data)

try:
    response_data = response.json()  # Safely attempt to parse the response as JSON
    pprint(response_data)
except ValueError:
    print("Response content is not in JSON format.")
