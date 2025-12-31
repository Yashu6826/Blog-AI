# configs/imagekit.py

import os
from imagekitio import ImageKit  # Must be 'imagekitio' package

# Only private_key is required in the constructor
imagekit = ImageKit(
    private_key="private_Suwp8kW9wIUkEI7r8AH1Ska41ug="
)

# Store the URL endpoint separately (used later for generating image URLs)
URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT")

# Optional: Public key if you need it elsewhere (not passed to constructor)
PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY")