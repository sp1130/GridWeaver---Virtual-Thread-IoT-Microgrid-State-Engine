package com.gridweaver.config;

import com.gridweaver.domain.BatteryState;
import com.gridweaver.domain.GridEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.statemachine.config.EnableStateMachineFactory;
import org.springframework.statemachine.config.EnumStateMachineConfigurerAdapter;
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer;
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer;

import java.util.EnumSet;

@Configuration
@EnableStateMachineFactory
public class BatteryStateMachineConfig
        extends EnumStateMachineConfigurerAdapter<BatteryState, GridEvent> {

    @Override
    public void configure(StateMachineStateConfigurer<BatteryState, GridEvent> states)
            throws Exception {
        states.withStates()
                .initial(BatteryState.IDLE)
                .states(EnumSet.allOf(BatteryState.class));
    }

    @Override
    public void configure(StateMachineTransitionConfigurer<BatteryState, GridEvent> transitions)
            throws Exception {
        transitions
                .withExternal()
                    .source(BatteryState.IDLE).target(BatteryState.CHARGING)
                    .event(GridEvent.START_CHARGE)
                .and()
                .withExternal()
                    .source(BatteryState.CHARGING).target(BatteryState.IDLE)
                    .event(GridEvent.STOP_CHARGE)
                .and()
                .withExternal()
                    .source(BatteryState.IDLE).target(BatteryState.DISCHARGING)
                    .event(GridEvent.START_DISCHARGE)
                .and()
                .withExternal()
                    .source(BatteryState.DISCHARGING).target(BatteryState.IDLE)
                    .event(GridEvent.STOP_DISCHARGE)
                .and()
                .withExternal()
                    .source(BatteryState.CHARGING).target(BatteryState.DISCHARGING)
                    .event(GridEvent.START_DISCHARGE)
                .and()
                .withExternal()
                    .source(BatteryState.DISCHARGING).target(BatteryState.CHARGING)
                    .event(GridEvent.START_CHARGE)
                .and()
                .withExternal()
                    .source(BatteryState.IDLE).target(BatteryState.FAULT)
                    .event(GridEvent.TRIP_FAULT)
                .and()
                .withExternal()
                    .source(BatteryState.CHARGING).target(BatteryState.FAULT)
                    .event(GridEvent.TRIP_FAULT)
                .and()
                .withExternal()
                    .source(BatteryState.DISCHARGING).target(BatteryState.FAULT)
                    .event(GridEvent.TRIP_FAULT)
                .and()
                .withExternal()
                    .source(BatteryState.FAULT).target(BatteryState.IDLE)
                    .event(GridEvent.RESET_FAULT);
    }
}
