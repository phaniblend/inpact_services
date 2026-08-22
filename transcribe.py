import whisper
import sys
import os

def transcribe_audio():
    # Check if you actually provided a filename in the command line
    if len(sys.argv) < 2:
        print("❌ Usage: python transcribe.py your_file.mp3")
        return

    file_path = sys.argv[1]

    if not os.path.exists(file_path):
        print(f"❌ Error: File '{file_path}' not found.")
        return

    print(f"Loading model... 🧠")
    model = whisper.load_model("base")

    print(f"Transcribing '{file_path}'... 🎙️")
    result = model.transcribe(file_path)

    # Save to a text file named after the audio file
    output_filename = f"{os.path.splitext(file_path)[0]}.txt"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(result["text"])
    
    print("\n--- Transcript ---")
    print(result["text"])
    print(f"\n✅ Saved to: {output_filename}")

if __name__ == "__main__":
    transcribe_audio()