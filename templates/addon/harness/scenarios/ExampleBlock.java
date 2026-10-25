import dev.golem.harness.api.*;

public class ExampleBlock implements Scenario {
    public void run(Client c) throws Exception {
        c.markLog();
        Fixtures.platform(c, 0, 100, 0, 6);
        Fixtures.placeOnTop(c, "{{modId}}:example_block", 0, 100, 2);
        Expect.block(c, 0, 101, 2, "{{modId}}:example_block");
        c.screenshot("example-block");
        Expect.logCleanSinceMark(c, "/(ERROR|FATAL)[]]");
    }
}
