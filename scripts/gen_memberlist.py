from pathlib import Path
import frontmatter
import json

if __name__ == "__main__":

    members = {}
    codeowners = Path("./CODEOWNERS").read_text().splitlines()
    for line in codeowners:
        split = line.split()
        at_id = split[0].rstrip('/')
        github_handle = split[1].lstrip('@')
        members[at_id] = {"github": github_handle}

    for at_id, github_handle in members.copy().items():
        index_file = Path(f"./src/members/{at_id}/index.mdx")
        if not index_file.exists():
            del members[at_id]
            continue
            
        front_matter = frontmatter.load(index_file)
        metadata = front_matter.metadata
        members[at_id]["name"] = metadata.get("name", "")
        members[at_id]["discord"] = metadata.get("discord", "")
        members[at_id]["avatar"] = metadata.get("avatar", "")
        members[at_id]["description"] = metadata.get("description", "")

    dest_file = Path("./public/members.json")
    dest_file.write_text(json.dumps(members, ensure_ascii=False))

