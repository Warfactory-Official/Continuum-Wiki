package {{package}}.platform.neoforge;

//? if neoforge {
{{neoforgeOpen}}import {{package}}.{{className}};
import {{package}}.{{className}}Entry;
import dev.golem.core.platform.ModEntries;
import net.neoforged.fml.common.Mod;

@Mod({{className}}.MOD_ID)
public final class NeoForgeInit {

    public NeoForgeInit() {
        ModEntries.start(new {{className}}Entry());
    }
}
{{neoforgeClose}}//?}
