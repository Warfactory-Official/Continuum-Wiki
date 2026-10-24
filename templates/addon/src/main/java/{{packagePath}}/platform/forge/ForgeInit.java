package {{package}}.platform.forge;

//? if forge {
{{forgeOpen}}import {{package}}.{{className}};
import {{package}}.{{className}}Entry;
import dev.golem.core.platform.ModEntries;
import net.minecraftforge.fml.common.Mod;

@Mod({{className}}.MOD_ID)
public final class ForgeInit {

    public ForgeInit() {
        ModEntries.start(new {{className}}Entry());
    }
}
{{forgeClose}}//?}
