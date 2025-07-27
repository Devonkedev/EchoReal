from dotenv import load_dotenv # type: ignore
import os
load_dotenv()

print(os.getenv("GENIUS_KEY"))