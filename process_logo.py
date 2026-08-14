import numpy as np
from PIL import Image

def process_image(input_path, output_path, bg_color):
    img = Image.open(input_path).convert('RGB')
    arr = np.array(img).astype(float)
    
    # Calculate Euclidean distance to background color
    diff = arr - np.array(bg_color)
    dist = np.sqrt(np.sum(diff**2, axis=2))
    
    # Create an alpha mask based on distance
    # If distance is 0, alpha is 0 (completely background)
    # If distance > threshold, alpha is 1 (completely foreground)
    threshold = 50.0
    alpha = np.clip(dist / threshold, 0, 1)
    
    # Blend original image with black background using the alpha mask
    # Actually, we can just multiply the original pixel by alpha, since background is black (0,0,0)
    # But to avoid making the foreground darker, we use the original foreground.
    # The true foreground color F can be estimated by removing the background contribution.
    # However, a simple blend is:
    # New_Color = F * alpha + Black * (1 - alpha)
    # If we assume arr is already blended with bg_color: arr = F * alpha + bg_color * (1 - alpha)
    # We want: New_arr = F * alpha
    # So: F * alpha = arr - bg_color * (1 - alpha)
    # Let's just do: New_arr = np.clip(arr - np.array(bg_color) * (1 - alpha[:, :, np.newaxis]), 0, 255)
    
    new_arr = np.clip(arr - np.array(bg_color) * (1 - alpha[:, :, np.newaxis]), 0, 255)
    
    out_img = Image.fromarray(new_arr.astype(np.uint8))
    out_img.save(output_path)

input_file = r'C:\Users\ADMIN-PC\Downloads\484915072_1065244125642075_3719996574211072947_n.jpg'
output_file = r'C:\Users\ADMIN-PC\Downloads\CAMA_Logo_Black.png'
bg = [17, 61, 62]

process_image(input_file, output_file, bg)
print('Done!')
