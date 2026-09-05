package com.gridweaver;

import com.gridweaver.domain.BatteryState;
import com.gridweaver.domain.GridEvent;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.statemachine.config.StateMachineFactory;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class BatteryStateMachineTest {

    @Autowired
    StateMachineFactory<BatteryState, GridEvent> factory;

    @Test
    void batteryCanEnterDischargeState() {
        var machine = factory.getStateMachine("test-battery");
        machine.startReactively().block();
        machine.sendEvent(GridEvent.START_DISCHARGE);
        assertEquals(BatteryState.DISCHARGING, machine.getState().getId());
    }
}
