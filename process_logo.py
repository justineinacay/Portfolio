from PIL import Image

img = Image.open('/tmp/file_attachments/JL_Monogram.png').convert("RGBA")
datas = img.get_flattened_data() if hasattr(img, 'get_flattened_data') else img.getdata()

# Make it the correct size and trim some black if possible?
# The issue is the logo in the top left is a bit small but it's there.
# Wait, let's just adjust the CSS to make the text in the logo visible.
# The user said "make the texts visibles."
# Ah, the text "J. Inacay" next to the logo.
