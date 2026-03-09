try:
    import fastapi
    import uvicorn
    import PIL
    import pydantic
    import requests
    import yfinance
    import apscheduler
    import prisma
    import telegram
    import dotenv
    print("Imports OK")
except ImportError as e:
    print(f"Import failed: {e}")
