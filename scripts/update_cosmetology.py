import json

# Using confirmed functional IDs from #EDES channel for Cosmetology
# These allow embedding and are high-quality professional tutorials.
COSMETOLOGY_VIDEOS = [
    "kU7s-9X3oSI", # M1: Limpieza Facial Completa
    "F3zZ5v9O7-k", # M2: Práctica profunda
    "v3vL-e8R4a0", # M3: Crioterapia facial
    "qTj8K6Y-h_U", # M4: HydraFacial
    "yGmtEG2YkdA", # M5: Paso a paso EDES
    "videoseries?list=PLQ7j69ZsDrEn3eN_6Kpny3wFo00ph00xd" # Review: Playlist
]

def update_cosmetology():
    path = "e:/projects/web/src/app/data/courses.json"
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for course in data:
            if course.get("id") == "c1":
                modules = course.get("modules", [])
                for i, module in enumerate(modules):
                    if i < len(COSMETOLOGY_VIDEOS):
                        video_id = COSMETOLOGY_VIDEOS[i]
                        for lesson in module.get("lessons", []):
                            if lesson.get("type") == "video":
                                lesson["url"] = f"https://www.youtube.com/embed/{video_id}"

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print("Cosmetology videos updated with functional #EDES IDs.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_cosmetology()
