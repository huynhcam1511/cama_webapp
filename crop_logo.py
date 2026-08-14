
from PIL import Image

def crop_transparent(image_path, output_path):
    img = Image.open(image_path)
    
    # Get the bounding box of the non-transparent alpha channel
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        alpha = img.convert('RGBA').split()[-1]
        bbox = alpha.getbbox()
        if bbox:
            img = img.crop(bbox)
            
    img.save(output_path)
    print(f'Cropped and saved to {output_path}')

input_file = r'public\cama_logo_print.png'
crop_transparent(input_file, input_file)
