import numpy as np
from PIL import Image

def process_image(input_path, output_path, bg_color):
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img).astype(float)
    
    # Calculate Euclidean distance to background color
    diff = arr[:, :, :3] - np.array(bg_color)
    dist = np.sqrt(np.sum(diff**2, axis=2))
    
    # Create an alpha mask based on distance
    threshold = 50.0
    alpha = np.clip(dist / threshold, 0, 1)
    
    # Set alpha channel
    arr[:, :, 3] = alpha * 255
    
    # Optional: remove the background color bias from the semi-transparent pixels
    # Since arr_rgb = fg * alpha + bg * (1 - alpha), 
    # fg = (arr_rgb - bg * (1 - alpha)) / alpha
    
    # To avoid divide by zero:
    alpha_safe = np.where(alpha == 0, 1, alpha)
    fg = (arr[:, :, :3] - np.array(bg_color) * (1 - alpha[:, :, np.newaxis])) / alpha_safe[:, :, np.newaxis]
    fg = np.clip(fg, 0, 255)
    
    # For completely transparent pixels, set RGB to 0 to avoid color bleeding
    fg[alpha == 0] = [0, 0, 0]
    
    arr[:, :, :3] = fg
    
    out_img = Image.fromarray(arr.astype(np.uint8))
    out_img.save(output_path)

input_file = r'C:\Users\ADMIN-PC\Downloads\484915072_1065244125642075_3719996574211072947_n.jpg'
output_file = r'public\cama_logo_print.png'
bg = [17, 61, 62]

process_image(input_file, output_file, bg)
print('Done transparent!')
