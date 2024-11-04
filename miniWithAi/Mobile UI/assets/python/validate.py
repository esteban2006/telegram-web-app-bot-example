import hashlib
import hmac
import json
from dataclasses import dataclass
from operator import itemgetter
from typing import Any
from urllib.parse import parse_qsl


@dataclass(eq=False)
class AuthError(Exception):
    status: int = 403
    detail: str = "unknown auth error"

    @property
    def message(self) -> str:
        return f"Auth error occurred, detail: {self.detail}"


class WebAppAuth:
    def __init__(self, bot_token: str) -> None:
        self._bot_token = bot_token
        self._secret_key = self._get_secret_key()

    def get_user_id(self, init_data: str) -> int:
        return int(json.loads(self._validate(init_data)["user"])["id"])

    def _get_secret_key(self) -> bytes:
        return hmac.new(
            key=b"WebAppData", msg=self._bot_token.encode(), digestmod=hashlib.sha256
        ).digest()

    def _validate(self, init_data: str) -> dict[str, Any]:
        try:
            parsed_data = dict(parse_qsl(init_data, strict_parsing=True))
        except ValueError as err:
            raise AuthError(detail="invalid init data") from err
        if "hash" not in parsed_data:
            raise AuthError(detail="missing hash")
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
            raise AuthError(detail="invalid hash")

        else:
            print(f"calculated {calculated_hash}\nhash {hash_}")
        return parsed_data


v = WebAppAuth("7738287101:AAE-mgrdPlfyoYXntQxqgFdE3mC3NLAwOTs")
# Correctly formatted init_data for testing
init_data = (
    "query_id=AAFPEON0AAAAAE8Q43RNXS94&"
    "user=%7B%22id%22%3A1961037903%2C%22first_name%22%3A%22Esteban%22%2C"
    "%22last_name%22%3A%22Jandres%22%2C%22username%22%3A%22eggsteban_503%22%2C"
    "%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&"
    "auth_date=1730613767&"
    "hash=aeb71c1b5b197410726796430f5df2fbc295954dd132f965f8135aa2a8357622"
)

print(v.get_user_id(init_data))
print(v._secret_key)
print(v._validate(init_data))
