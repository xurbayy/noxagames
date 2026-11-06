from PIL import Image
import os

src = r"C:\Users\AKBAR\Downloads\noxa.png"
dst_dir = r"E:\NEGOXIA\noxaweb\public"

img = Image.open(src).convert("RGBA")
print(f"Original: {img.width}x{img.height}")

# Resize function
def resize_and_save(base_img, size, path):
    resized = base_img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(path, "PNG")
    print(f"  {size}x{size} -> {path}")

# Favicon ICO (multi-size)
ico_sizes = [16, 32, 48, 64, 128, 256]
ico_images = [img.resize((s, s), Image.Resampling.LANCZOS) for s in ico_sizes]
ico_images[0].save(
    os.path.join(dst_dir, "favicon.ico"),
    format="ICO",
    sizes=[(s, s) for s in ico_sizes]
)
print(f"  favicon.ico -> multi-size {ico_sizes}")

# PNG sizes
sizes = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "favicon-48x48.png": 48,
    "favicon-96x96.png": 96,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
    "apple-touch-icon.png": 180,
    "icon-square.png": 512,
    "logo.png": 512,
    "logo-wordmark.png": 512,  # keep same for now
}

for fname, size in sizes.items():
    resize_and_save(img, size, os.path.join(dst_dir, fname))

# Also copy to bot assets for avatar reference
bot_assets = r"E:\NEGOXIA\BOT HOSTING\nexora\assets"
resize_and_save(img, 512, os.path.join(bot_assets, "noxa.png"))
resize_and_save(img, 1024, os.path.join(bot_assets, "noxa-1024.png"))

print("\nDone! All assets generated.")