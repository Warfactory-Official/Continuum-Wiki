package {{package}}.registry;

import {{package}}.{{className}};
import com.hbm.creativetabs.HbmTab;
import com.hbm.registration.Presets;
import dev.golem.core.registry.BlockTag;
import dev.golem.core.registry.DeferredRegister;
import dev.golem.core.registry.Loot;
import dev.golem.core.registry.Registrar;
import dev.golem.core.registry.RegistryObject;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.SoundType;

public final class {{className}}Blocks {

    public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks({{className}}.MOD_ID);
    public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems({{className}}.MOD_ID);
    private static final Registrar REG = Registrar.of(BLOCKS, ITEMS);

    // Read SoundType inside the lambda: Dejson loads this class in a plain JVM, where 1.20.1 cannot touch it.
    public static final RegistryObject<Block> EXAMPLE_BLOCK = REG.simpleBlock("example_block",
                    p -> p.strength(5.0F, 10.0F).sound(SoundType.METAL).requiresCorrectToolForDrops())
            .transform(Presets.cubeAll()).loot(Loot.self()).tag(BlockTag.PICKAXE);
    public static final RegistryObject<BlockItem> EXAMPLE_BLOCK_ITEM = REG.blockItem(EXAMPLE_BLOCK).tab(HbmTab.BLOCKS);

    private {{className}}Blocks() {}

    public static void init() {}
}
