from pathlib import Path
import frontmatter
import asyncio
import discord

TOKEN = os.environ["DISCORD_TOKEN"]
GUILD_ID = int(os.environ["GUILD_ID"])
ROLE_ID = int(os.environ["ROLE_ID"])
CHANNEL_ID = int(os.environ["CHANNEL_ID"])

intents = discord.Intents.default()
intents.members = True
intents.guilds = True

client = discord.Client(intents=intents)

def load_all_frontmatters(base_dir):
    base_path = Path(base_dir)
    results = []

    for subdir in base_path.iterdir():
        if subdir.is_dir():
            index_file = subdir / "index.mdx"
            if index_file.exists():
                try:
                    post = frontmatter.load(index_file)
                    results.append({
                        "path": str(index_file),
                        "metadata": post.metadata,
                    })
                except Exception as e:
                    print(f"Error reading {index_file}: {e}")

    return results


@client.event
async def on_ready():

    frontmatters = load_all_frontmatters("../src/members/")
    for item in frontmatters:
        print(f"{item['metadata'].get('discord')}")

    print(f"Logged in as {client.user}")

    guild = client.get_guild(GUILD_ID)
    if guild is None:
        print("指定されたギルドが見つかりません。")
        await client.close()
        return

    role = guild.get_role(ROLE_ID)
    if role is None:
        print(f"ロールID '{ROLE_ID}' のロールが見つかりませんでした。")
        await client.close()
        return

    members = [m for m in guild.members if role in m.roles]
    print(f"ロール「{role.name}」を持つメンバー一覧（{len(members)}人）:")
    for m in members:
        print(f"- {m.name}#{m.discriminator} ({m.id})")

    missing_members = []
    for item in frontmatters:
        discord_id = item['metadata'].get('discord')
        if discord_id:
            member = guild.get_member(int(discord_id))
            if member and role not in member.roles:
                missing_members.append(member)

    processed_members = []
    if missing_members:
        print(f"ロール「{role.name}」が不足しているメンバー:")
        for m in missing_members:
            print(f"- {m.name}#{m.discriminator} ({m.id})")
            try:
                await m.add_roles(role)
                print(f"ロールを追加しました: {m.name}#{m.discriminator}")
                processed_members.append(m)
            except Exception as e:
                print(f"ロールの追加に失敗しました: {m.name}#{m.discriminator}, エラー: {e}")
    else:
        print(f"全てのメンバーがロール「{role.name}」を持っています。")

    channel = guild.get_channel(CHANNEL_ID)

    for m in processed_members:
        try:
            await channel.send(f"{m.mention} PRがマージされました\N{Party Popper}\nロール{role.name}を付与しました。Anthrotechへようこそ！")
            print(f"メッセージを送信しました: {m.name}#{m.discriminator}")
        except Exception as e:
            print(f"メッセージの送信に失敗しました: {m.name}#{m.discriminator}, エラー: {e}")

    await client.close()

asyncio.run(client.start(TOKEN))


