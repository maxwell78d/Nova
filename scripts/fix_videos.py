import json

# Mapping of course ID to stable, popular YouTube Video IDs
# These are chosen for high availability and compatibility.
VIDEO_MAPPING = {
    "c1": "n7eW-9p6-yY", # Belleza (Manicura y Pedicura)
    "c2": "n7eW-9p6-yY", # Uñas
    "c3": "XbH7yR9P_fM", # Farmacia (General Tech/Intro)
    "c4": "XbH7yR9P_fM", # Envejecientes
    "c5": "VvU6Sre_4M8", # Informática (Excel - Ultra Stable)
    "c6": "aqz-KE-bpKQ", # Inglés (Beginners - Ultra Stable)
    "c7": "n7eW-9p6-yY", # Masaje
    "c8": "XbH7yR9P_fM", # Celulares
    "c9": "VvU6Sre_4M8", # Secretariado
    "c10": "VvU6Sre_4M8", # Inversores
}

def update_videos():
    path = "e:/projects/web/src/app/data/courses.json"
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for course in data:
            course_id = course.get("id")
            video_id = VIDEO_MAPPING.get(course_id, "VvU6Sre_4M8")
            
            for module in course.get("modules", []):
                for lesson in module.get("lessons", []):
                    if lesson.get("type") == "video":
                        lesson["url"] = f"https://www.youtube.com/embed/{video_id}"

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print("YouTube URLs updated with stable IDs.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_videos()
