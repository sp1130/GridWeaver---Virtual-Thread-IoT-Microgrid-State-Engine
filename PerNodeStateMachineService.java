package com.gridweaver.service;

import com.gridweaver.domain.BatteryState;
import com.gridweaver.domain.GridEvent;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class PerNodeStateMachineService {
    private final StateMachineFactory<BatteryState, GridEvent> factory;
    private final ConcurrentMap<String, StateMachine<BatteryState, GridEvent>> machines = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, Object> locks = new ConcurrentHashMap<>();

    public PerNodeStateMachineService(StateMachineFactory<BatteryState, GridEvent> factory) { this.factory = factory; }

    public BatteryState stateOf(String nodeId) {
        StateMachine<BatteryState, GridEvent> machine = machine(nodeId);
        return machine.getState().getId();
    }

    public BatteryState send(String nodeId, GridEvent event) {
        Object lock = locks.computeIfAbsent(nodeId, k -> new Object());
        synchronized (lock) {
            StateMachine<BatteryState, GridEvent> machine = machine(nodeId);
            machine.sendEvent(event);
            return machine.getState().getId();
        }
    }

    private StateMachine<BatteryState, GridEvent> machine(String nodeId) {
        return machines.computeIfAbsent(nodeId, id -> {
            StateMachine<BatteryState, GridEvent> machine = factory.getStateMachine(id);
            machine.start();
            return machine;
        });
    }

    public int machineCount() { return machines.size(); }
}
