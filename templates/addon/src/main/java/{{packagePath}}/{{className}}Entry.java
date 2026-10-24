package {{package}};

{{#example}}
import {{package}}.registry.{{className}}Blocks;
import com.hbm.api.event.HbmEvents;
{{/example}}
import dev.golem.core.platform.ModEntry;

public final class {{className}}Entry implements ModEntry {

    @Override
    public void declare() {
{{#example}}
        {{className}}Blocks.init();
        HbmEvents.MACHINE_RECIPE_COMPLETED.register(event -> {
            if (event.recipe().equals("ass.example_block")) {
                {{className}}.LOG.info("Example block made at {} by {}", event.pos(), event.machine());
            }
        });
{{/example}}
{{^example}}
        {{className}}.LOG.info("{{modNameJava}} loaded");
{{/example}}
    }
}
