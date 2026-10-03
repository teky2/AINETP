import struct
import zlib
import math
import os

def create_png(width, height, get_pixel_func):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type None
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw_data.extend((int(max(0, min(255, r))),
                             int(max(0, min(255, g))),
                             int(max(0, min(255, b))),
                             int(max(0, min(255, a)))))
    
    compressed = zlib.compress(bytes(raw_data), level=9)
    
    def make_chunk(chunk_type, data):
        length = struct.pack(">I", len(data))
        crc = struct.pack(">I", zlib.crc32(chunk_type + data) & 0xffffffff)
        return length + chunk_type + data + crc

    png_bytes = bytearray(b"\x89PNG\r\n\x1a\n")
    # IHDR: width, height, bit_depth=8, color_type=6 (RGBA), comp=0, filter=0, interlace=0
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png_bytes.extend(make_chunk(b"IHDR", ihdr_data))
    png_bytes.extend(make_chunk(b"IDAT", compressed))
    png_bytes.extend(make_chunk(b"IEND", b""))
    return bytes(png_bytes)

def icon_pixel(x, y, w, h, maskable=False):
    # Normalized coordinates [-1, 1]
    if maskable:
        # Scale down into safe zone (0.78 scale factor)
        nx = ((x / (w - 1)) * 2 - 1) / 0.78
        ny = ((y / (h - 1)) * 2 - 1) / 0.78
    else:
        nx = (x / (w - 1)) * 2 - 1
        ny = (y / (h - 1)) * 2 - 1

    dist_from_center = math.sqrt(nx * nx + ny * ny)

    # Base background: Dark navy-slate
    # If maskable and outside safe inner box, keep full-bleed dark background
    bg_r = 8 + int(8 * (1 - ny) * 0.5)
    bg_g = 14 + int(10 * (1 - ny) * 0.5)
    bg_b = 26 + int(14 * (1 - ny) * 0.5)
    bg_a = 255

    # If standard icon (not maskable), apply rounded squircle alpha corner
    if not maskable:
        # Corner radius check (~0.88 max in superellipse)
        squircle = abs(nx)**4.5 + abs(ny)**4.5
        if squircle > 1.05:
            return (0, 0, 0, 0) # Transparent outside icon
        elif squircle > 0.95:
            # anti-alias edge
            aa = 1.0 - (squircle - 0.95) / 0.1
            bg_a = int(255 * aa)

    # Dial track: radius around 0.65 to 0.78
    angle = math.atan2(ny + 0.1, nx) # from -pi to pi
    # Dial arc from 135 deg to 405 deg (or bottom left to bottom right)
    r = math.hypot(nx, ny + 0.1)
    
    # Outer track background
    if 0.55 <= r <= 0.75:
        # Check angle for open gauge bottom
        angle_deg = math.degrees(math.atan2(ny + 0.1, nx))
        # open at bottom between 50 and 130 degrees
        if not (50 < angle_deg < 130):
            # Track slot
            bg_r = 25
            bg_g = 35
            bg_b = 55

            # Active illuminated gauge arc (from 130 to 330 deg)
            norm_angle = (angle_deg - 130) % 360
            if norm_angle < 220:
                # Gradient from Cyan (0, 180, 255) to Teal (16, 215, 160)
                t = norm_angle / 220.0
                cr = int(6 * (1 - t) + 16 * t)
                cg = int(182 * (1 - t) + 215 * t)
                cb = int(212 * (1 - t) + 120 * t)
                # Soft neon glow
                bg_r = cr
                bg_g = cg
                bg_b = cb

    # Center Hub & Pulse Line
    hub_r = math.hypot(nx, ny + 0.1)
    if hub_r < 0.28:
        # Dark inner disc
        bg_r = 10
        bg_g = 18
        bg_b = 32
        if hub_r > 0.24:
            # Hub glowing border
            bg_r = 30
            bg_g = 180
            bg_b = 230

    # Pulse Waveform across center (y approx -0.1)
    py = ny + 0.1
    px = nx
    if -0.45 <= px <= 0.45:
        # wave calculation
        target_y = 0.0
        if -0.25 <= px < -0.12:
            target_y = -0.15 * ((px + 0.25) / 0.13)
        elif -0.12 <= px < 0.05:
            target_y = -0.15 + 0.35 * ((px + 0.12) / 0.17)
        elif 0.05 <= px < 0.18:
            target_y = 0.20 - 0.30 * ((px - 0.05) / 0.13)
        elif 0.18 <= px < 0.30:
            target_y = -0.10 + 0.10 * ((px - 0.18) / 0.12)

        dist_to_wave = abs(py - target_y)
        if dist_to_wave < 0.035:
            # Bright cyan pulse
            intensity = 1.0 - (dist_to_wave / 0.035)
            bg_r = int(bg_r * (1 - intensity) + 56 * intensity)
            bg_g = int(bg_g * (1 - intensity) + 215 * intensity)
            bg_b = int(bg_b * (1 - intensity) + 248 * intensity)

    # Speed Needle Arrow from center (0, -0.1) to (0.35, -0.45)
    dx = nx - 0.0
    dy = (ny + 0.1)
    # project point on needle vector (0.35, -0.35)
    vx = 0.38
    vy = -0.38
    vlen2 = vx * vx + vy * vy
    proj = (dx * vx + dy * vy) / vlen2
    if 0.0 <= proj <= 1.0:
        perp_dist = math.hypot(dx - proj * vx, dy - proj * vy)
        needle_width = 0.025 * (1.0 - proj * 0.4)
        if perp_dist < needle_width:
            bg_r = 52
            bg_g = 211
            bg_b = 153

    return (bg_r, bg_g, bg_b, bg_a)

os.makedirs("./public", exist_ok=True)

print("Generating pwa-192x192.png...")
png_192 = create_png(192, 192, lambda x, y, w, h: icon_pixel(x, y, w, h, maskable=False))
with open("./public/pwa-192x192.png", "wb") as f:
    f.write(png_192)

print("Generating pwa-512x512.png...")
png_512 = create_png(512, 512, lambda x, y, w, h: icon_pixel(x, y, w, h, maskable=False))
with open("./public/pwa-512x512.png", "wb") as f:
    f.write(png_512)

print("Generating pwa-maskable-512x512.png...")
png_maskable = create_png(512, 512, lambda x, y, w, h: icon_pixel(x, y, w, h, maskable=True))
with open("./public/pwa-maskable-512x512.png", "wb") as f:
    f.write(png_maskable)

print("Generating apple-touch-icon.png (180x180)...")
png_180 = create_png(180, 180, lambda x, y, w, h: icon_pixel(x, y, w, h, maskable=False))
with open("./public/apple-touch-icon.png", "wb") as f:
    f.write(png_180)

print("Generating favicon.ico...")
# Simple 32x32 PNG inside ICO format
png_32 = create_png(32, 32, lambda x, y, w, h: icon_pixel(x, y, w, h, maskable=False))
# ICO header: 6 bytes + 1 directory entry (16 bytes) + PNG data
ico_data = bytearray()
ico_data.extend(struct.pack("<HHH", 0, 1, 1)) # idReserved, idType=1, idCount=1
ico_data.extend(struct.pack("<BBBBHHII", 32, 32, 0, 0, 1, 32, len(png_32), 22))
ico_data.extend(png_32)
with open("./public/favicon.ico", "wb") as f:
    f.write(bytes(ico_data))

print("All Android & PWA icons successfully generated!")
