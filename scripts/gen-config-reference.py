"""Writes src/shared/reference/config.md from NTM - Continuum's source: every hbm.cfg key, every hbmServer.json key
and every RBMK gamerule, with defaults and the descriptions the mod writes into the files.

    python scripts/gen-config-reference.py ../new-hbm
"""
import json
import pathlib
import re
import sys

HBM = pathlib.Path(sys.argv[1]) / "src/main/java/com/hbm"
OUT = pathlib.Path(__file__).resolve().parent.parent / "src/shared/reference/config.md"
STR = r'"(?:[^"\\]|\\.)*"'

CATEGORY_TITLES = {
    "01_general": "General", "02_ores": "Ores", "03_nukes": "Nukes", "04_dungeons": "Dungeons",
    "05_meteors": "Meteors", "06_explosions": "Explosions", "07_missile_machines": "Missile machines",
    "08_potion_effects": "Potion effects", "09_machines": "Machines", "10_dangerous_drops": "Dangerous drops",
    "11_tools": "Tools", "12_mobs": "Mobs", "13_radiation": "Radiation", "14_hazard": "Hazards",
    "15_structures": "Structures", "16_pollution": "Pollution", "17_biomes": "Biomes", "18_weapons": "Weapons",
    "528": "528 mode", "LESS BULLSHIT MODE": "Less Bullshit Mode",
}


def read(path):
    return pathlib.Path(path).read_text(encoding="utf-8", errors="replace")


def strings(expr):
    return "".join(json.loads(p) for p in re.findall(STR, expr))


def split_args(s):
    """Top-level arguments of a call whose opening parenthesis was just consumed."""
    out, depth, cur, quoted, i = [], 0, "", False, 0
    while i < len(s):
        c = s[i]
        if quoted:
            cur += c
            if c == "\\":
                cur += s[i + 1]
                i += 1
            elif c == '"':
                quoted = False
        elif c == '"':
            quoted, cur = True, cur + c
        elif c in "([{":
            depth, cur = depth + 1, cur + c
        elif c in ")]}":
            if depth == 0:
                out.append(cur.strip())
                return out, i
            depth, cur = depth - 1, cur + c
        elif c == "," and depth == 0:
            out.append(cur.strip())
            cur = ""
        else:
            cur += c
        i += 1
    return out, i


def default_text(expr):
    expr = expr.strip()
    if expr.startswith("new ") and "{" in expr:
        return ", ".join(strings(x) or x.strip().replace("Constants.MOD_ID", "hbm") for x in expr[expr.index("{") + 1:expr.rindex("}")].split(","))
    if expr.startswith('"'):
        return strings(expr)
    expr = re.sub(r"(?<=\d)[FfDdLl]$", "", expr)
    return expr.replace("Constants.MOD_ID", "hbm").replace("_", "")


def cfg_keys():
    common = read(HBM / "config/CommonConfig.java")
    categories = dict(re.findall(r'(CATEGORY_\w+)\s*=\s*"([^"]+)"', common))
    rows = {}
    for f in sorted((HBM / "config").glob("*.java")):
        text = read(f)
        local = {a: categories[b] for a, b in re.findall(r'final String (\w+)\s*=\s*CommonConfig\.(CATEGORY_\w+)', text)}
        cat = lambda name: local.get(name.split(".")[-1], categories.get(name.split(".")[-1], name))
        for m in re.finditer(r'createConfig(Int|Double|Bool|String|IntList|StringList)\s*\(', text):
            args, _ = split_args(text[m.end():])
            if len(args) < 5 or not args[2].startswith('"'):
                continue
            rows[(cat(args[1]), json.loads(args[2]))] = (strings(args[3]), default_text(args[4]))
        for m in re.finditer(r'(\w+)\s*=\s*config\.get\s*\(', text):
            args, end = split_args(text[m.end():])
            if len(args) < 3 or not args[1].startswith('"'):
                continue
            comment = strings(args[3]) if len(args) > 3 else ""
            tail = text[m.end() + end:m.end() + end + 800]
            cm = re.search(re.escape(m.group(1)) + r'\.comment\s*=\s*((?:' + STR + r'\s*\+?\s*)+);', tail)
            if cm:
                comment = strings(cm.group(1))
            rows[(cat(args[0]), json.loads(args[1]))] = (comment, default_text(args[2]))
    return rows


def server_keys():
    text = read(HBM / "config/ServerConfig.java")
    defaults = {"MINE_AP_DAMAGE": "10", "MINE_HE_DAMAGE": "35", "MINE_SHRAP_DAMAGE": "7.5", "MINE_NUKE_DAMAGE": "100",
                "MINE_NAVAL_DAMAGE": "60", "AUTOCAL_MAX_CLOCK": "20", "ITEM_HAZARD_DROP_TICKRATE": "2"}
    for name, value in re.findall(r'ConfigWrapper<\w+> (\w+) = new ConfigWrapper<>\(([^)]*)\)', text):
        defaults[name] = default_text(value)
    keys = re.findall(r'configMap\.put\("(\w+)"', text)
    guns = {}
    for f in sorted((HBM / "items/weapon/sedna/factory").glob("*.java")):
        t = read(f)
        values = dict(re.findall(r'(GUN_\w+)\s*=\s*new ConfigWrapper<>\(([^)]*)\)', t))
        for key in re.findall(r'configMap\.put\("(GUN_\w+)"', t):
            guns[key] = default_text(values.get(key, "?"))
    return [(k, defaults.get(k, "?")) for k in keys], sorted(guns.items())


def dials():
    text = read(HBM / "tileentity/machine/rbmk/RBMKDials.java")
    out = []
    for kind, name, args in re.findall(r'WorldRules\.(bool|decimal|integer)\("(\w+)",\s*([^)]*)\)', text):
        parts = [default_text(a) for a in args.split(",")]
        bounds = "" if kind == "bool" else f"{parts[1]} to {parts[2].replace('Double.MAXVALUE', 'any')}"
        out.append((name, {"bool": "boolean", "decimal": "number", "integer": "integer"}[kind], parts[0], bounds))
    return out


DIAL_TEXT = {
    "dialSaveDials": "Keep the dials as set; `false` resets every dial to its default when the world loads.",
    "dialPassiveCooling": "Heat per tick a column at the edge of the reactor loses on its own.",
    "dialPassiveCoolingInner": "Heat per tick a column surrounded by other columns loses on its own.",
    "dialColumnHeatFlow": "How quickly neighbouring columns' heat evens out: 1 is instant, 0.5 halves the difference each step.",
    "dialDiffusionMod": "Multiplier on how quickly a fuel rod's core and hull temperatures even out.",
    "dialHeatProvision": "How quickly a fuel rod's hull heat and its column's heat even out: 1 is instant.",
    "dialColumnHeight": "How tall the reactor structure is, in blocks.",
    "dialEnablePermaScrap": "Debris stays until picked up instead of despawning.",
    "dialBoilerHeatConsumption": "Heat units a steam channel uses per mB of water.",
    "dialControlSpeed": "Multiplier on how quickly control rods move.",
    "dialReactivityMod": "Multiplier on how much flux fuel rods give out.",
    "dialOutgasserSpeedMod": "Multiplier on irradiation channel speed.",
    "dialControlSurgeMod": "Multiplier on how high the power surge goes when control rods are inserted.",
    "dialFluxRange": "How far a normal fuel rod's flux reaches, in columns.",
    "dialReasimRange": "How far a ReaSim fuel rod's flux reaches, in columns.",
    "dialReasimBoilers": "Every column acts as a boiler, with dedicated inlet and outlet blocks. Also on when `hbm.cfg` 528 mode forces it.",
    "dialReasimBoilerSpeed": "Share of the possible steam a ReaSim boiler makes per tick.",
    "dialDisableMeltdowns": "Overheating fuel columns do not start a meltdown.",
    "dialEnableMeltdownOverpressure": "Connected pipes and turbines explode when the reactor melts down.",
    "dialModeratorEfficiency": "Share of neutrons a moderator turns from fast to slow.",
    "dialAbsorberEfficiency": "Share of neutrons an absorber column absorbs.",
    "dialReflectorEfficiency": "Share of neutrons a reflector column reflects.",
    "dialDisableDepletion": "Fuel rods never deplete.",
    "dialDisableXenon": "No xenon poisoning.",
    "dialAbsorberHeatConversion": "°C of heat an absorber gains per unit of flux it absorbs.",
}


SERVER_TEXT = {
    "DAMAGE_COMPATIBILITY_MODE": "1.7's compatibility path for HBM damage, which also applies knockback multipliers.",
    "MINE_AP_DAMAGE": "Damage of the anti-personnel landmine.",
    "MINE_HE_DAMAGE": "Damage of the high-explosive landmine.",
    "MINE_SHRAP_DAMAGE": "Damage of each shrapnel piece from the shrapnel landmine.",
    "MINE_NUKE_DAMAGE": "Damage of the nuclear landmine.",
    "MINE_NAVAL_DAMAGE": "Damage of the naval mine.",
    "ENTITY_TAINT_TRAILS": "Tainted creepers and the taint effect leave spreading taint behind.",
    "CRATE_OPEN_HELD": "The tungsten crate can be opened from the hand.",
    "CRATE_KEEP_CONTENTS": "Crates and clutter keep their contents when broken.",
    "ITEM_HAZARD_DROP_TICKRATE": "How often, in ticks, dropped hazardous items apply their hazards.",
    "ENABLE_MKU": "The MKU contagion can spread.",
    "STRUCTURE_DEBUG": "Built structures keep their placeholders visible (air, jigsaw and loot markers).",
    "AUTOCAL_MAX_CLOCK": "Clock cycles an AUTOCAL unit runs per game tick.",
    "MAX_BUFFER_LENGTH": "Longest text buffer Redstone-over-Radio script parsing accepts.",
    "MAX_STACK_SIZE": "Deepest value stack Redstone-over-Radio script parsing allows.",
    "CONVEYOR_CRAM_MAX": "Items in one conveyor cell before the jam pops.",
    "CONVEYOR_CRAM_EXPLODE": "A long-lasting conveyor jam breaks the belt under it.",
    "ULTRA_LARP_MODE": "Large doors open by redstone only, except doors that never need it.",
    "DEBUG_PORT_VIEW": "Machine ports show their connections with particles.",
}


def cell(text):
    return text.replace("|", "\\|").replace("\n", " ").strip()


def main():
    cfg = cfg_keys()
    server, guns = server_keys()
    lines = ["---", "title: Config files",
             "description: Every hbm.cfg key, every hbmServer.json key and every RBMK gamerule, with defaults.",
             "sidebar:", "  order: 4", "---", "",
             "These settings live in config files and gamerules, not in datapacks. This page is generated from the mod's "
             "source by `scripts/gen-config-reference.py`, so it lists exactly what NTM - Continuum writes.", "",
             "| Where | Applies to | When changes apply |", "|---|---|---|",
             "| `config/hbm.cfg` | The whole game or server | Restart |",
             "| `config/hbmConfig/hbmServer.json` | The whole server | Restart, or `/ntmserver set` in game |",
             "| RBMK gamerules | One world | At once (`/gamerule`) |", "",
             "Other config files: `hbmClient.json` (client display settings, `/ntmclient`), [`hbmMachines.json`](../machine-settings/) (per-machine "
             "values), `hbmRadResist.json` (radiation resistance per item) and the [custom machine files](../../data/custom-machines/).",
             "", "## hbm.cfg", "",
             f"1.7's main config: {len(cfg)} keys in {len({c for c, _ in cfg})} categories, with 1.7's names, so a 1.7 "
             "file carries over. Keys 1.7 had that do nothing in Continuum are not written. The game writes every key with "
             "its default the first time it starts.", ""]
    order = list(CATEGORY_TITLES)
    for category in sorted({c for c, _ in cfg}, key=lambda c: order.index(c) if c in order else 99):
        lines += [f"### {CATEGORY_TITLES.get(category, category)}", "", f"Category `{category}`.", "",
                  "| Key | Default | Description |", "|---|---|---|"]
        for (c, key), (comment, default) in sorted(cfg.items(), key=lambda kv: kv[0][1]):
            if c == category:
                lines.append(f"| `{key}` | `{cell(default)}` | {cell(comment)} |")
        lines.append("")
    lines += ["## hbmServer.json", "",
              "1.7's server variables. List and change them in game with `/ntmserver` (`/ntmserver set <key> <value>`); "
              "the file is rewritten with the running values.", "",
              "| Key | Default | Effect |", "|---|---|---|"]
    lines += [f"| `{k}` | `{v}` | {SERVER_TEXT.get(k, '')} |" for k, v in server]
    lines += ["", "### Gun damage", "",
              "Each gun's base damage per bullet, before the bullet type's multiplier.", "",
              "| Key | Default |", "|---|---|"]
    lines += [f"| `{k}` | `{v}` |" for k, v in guns]
    lines += ["", "## RBMK gamerules", "",
              "The RBMK's dials are per-world gamerules, changed with `/gamerule <name> <value>` and applied at once.", "",
              "| Gamerule | Type | Default | Range | Effect |", "|---|---|---|---|---|"]
    for name, kind, default, bounds in dials():
        lines.append(f"| `{name}` | {kind} | `{default}` | {bounds} | {DIAL_TEXT.get(name, '')} |")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{OUT}: {len(cfg)} hbm.cfg keys, {len(server)} server keys, {len(guns)} gun keys")


main()
