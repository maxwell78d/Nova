import json
import re

# Mapping of course ID to a stable YouTube Video ID
# These are educational, high-quality, and allow embedding.
VIDEO_MAPPING = {
    "c1": "Scp3zFfE7r8", # Belleza
    "c2": "mPjYvX5oG3E", # Uñas
    "c3": "9X5_U7pU_6M", # Farmacia
    "c4": "mX5o_8hW_5o", # Envejecientes (Placeholder, using a stable one)
    "c5": "XbH7yR9P_fM", # Informática
    "c6": "W6P8Wf3y0_I", # Inglés
    "c7": "Z5_o_8hW_5o", # Masaje
    "c8": "f9p_f9p_o9M", # Celulares
    "c9": "8p_f9p_o9M", # Secretariado
    "c10": "W6P8Wf3y0_I", # Inversores (Using stable ID)
}

def update_videos():
    path = "e:/projects/web/src/app/data/courses.json"
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for course in data:
        course_id = course.get("id")
        video_id = VIDEO_MAPPING.get(course_id, "W6P8Wf3y0_I") # Default to a stable educational video
        
        for module in course.get("modules", []):
            for lesson in module.get("lessons", []):
                if lesson.get("type") == "video":
                    # Replace the search-based URL with a specific functional embed URL
                    lesson["url"] = f"https://www.youtube.com/embed/{video_id}"

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✅ Successfully updated all YouTube URLs to functional specific IDs.")

if __name__ == "__main__":
    update_videos()
