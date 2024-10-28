import hmac
from hashlib import sha256
import time

# Replace with your bot's token
BOT_TOKEN = "your-telegram-bot-token"


def create_secret_key(token):
    """Generate the secret key using HMAC-SHA-256."""
    return hmac.new(b"WebAppData", token.encode(), sha256).digest()


def validate_telegram_data(init_data):
    """Validate the initData received from Telegram."""
    # Split the query string into key-value pairs
    params = dict([param.split("=", 1) for param in init_data.split("&")])
    received_hash = params.pop("hash", None)  # Extract the 'hash' parameter

    if not received_hash:
        return False, "Hash not found in the data"

    # Generate the data-check-string (sorted alphabetically)
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))

    # Generate the secret key using the bot token
    secret_key = create_secret_key(BOT_TOKEN)

    # Generate the HMAC-SHA-256 hash of the data-check-string
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), sha256
    ).hexdigest()

    # Verify the received hash against the calculated hash
    if not hmac.compare_digest(calculated_hash, received_hash):
        return False, "Hash mismatch: Invalid data"

    # Optional: Check if the auth_date is too old
    auth_date = int(params.get("auth_date", 0))
    current_time = int(time.time())

    if current_time - auth_date > 86400:  # 86400 seconds = 1 day
        return False, "Data is too old"

    return True, "Data is valid"


# Example usage
if __name__ == "__main__":
    # Example initData string (replace with actual data for testing)
    init_data = {
        "query_id": "AAFPEON0AAAAAE8Q43RE1kU4",
        "user": {
            "id": 1961037903,
            "first_name": "Esteban",
            "last_name": "Jandres",
            "username": "eggsteban_503",
            "language_code": "en",
            "allows_write_to_pm": True,
        },
        "auth_date": "1729950846",
        "hash": "ef7843d765025dce36a955562fd3af8190ef99c5cbcbceea693e1e491e79cf05",
    }

    is_valid, message = validate_telegram_data(init_data)

    if is_valid:
        print("Success:", message)
    else:
        print("Error:", message)
