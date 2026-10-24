package {{package}}.recipe;

import static dev.golem.core.dejson.Crafting.rows;
import static dev.golem.core.dejson.Crafting.shaped;

/** Crafting recipes, written to data/{{modId}}/recipe at build time. Runs in a plain JVM, so items are string ids. */
public final class {{className}}CraftingRecipes {

    private static final String NS = "{{modId}}";

    private {{className}}CraftingRecipes() {}

    public static void declare() {
        shaped(NS, "example_block", "{{modId}}:example_block", rows("##", "##"), "#", "hbm:plate_steel");
    }
}
