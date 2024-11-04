import json
from .validate import *


def main(context):
    context.log("Function executed with the following context:")
    context.log(f"Received request method: {context.req.method}")

    def create_response(data, status=200):
        response_body = json.dumps(data)
        response = {
            "status": status,
            "body": response_body,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Content-Type": "application/json",
            },
        }
        return response

    if context.req.method == "POST":
        try:
            # Directly use context.req.body if it's already a dictionary
            data = context.req.body
            context.log(f"Received Data: {data}")
            context.log(f"Update: {data['update']}")
        except Exception as e:
            context.error(f"Error reading request body: {e}")
            return create_response(
                {"error": f"Error reading request body: {e}\nReceived Data: {data}"},
                400,
            )

        try:

            if data["update"] == "validate":
                try:
                    validation = validate_telegram_load(data["init_data"])
                    return create_response({"is_valid": validation})
                except Exception as e:
                    context.error(f"Error fetching key: {e}")
                    return create_response(
                        {"error": "Error fetching key", "details": str(e)}, 500
                    )

        except Exception as e:
            context.error(f"Error processing request: {e}")
            import traceback

            error_message = traceback.format_exc()
            context.error(f"Traceback: {error_message}")
            return create_response(
                {"error": "Error processing request", "details": str(e)}, 400
            )

    else:
        context.error("Unsupported request method")
        return create_response("Only POST requests are supported", 405)
