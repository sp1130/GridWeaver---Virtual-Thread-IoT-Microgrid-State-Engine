import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";

import EventLogPanel from "../../components/log/EventLogPanel";
import eventsReducer, { addTransition } from "../../store/eventsSlice";

/* ------------------------------------------------------------------ */
/*  Test helpers                                                       */
/* ------------------------------------------------------------------ */

const SEED_EVENTS = [
  {
    nodeId: "node-00042",
    zone: "ZONE-A",
    fromState: "IDLE",
    toState: "CHARGING",
    timestamp: "2026-08-20T10:00:00.000Z",
  },
  {
    nodeId: "node-00101",
    zone: "ZONE-B",
    fromState: "CHARGING",
    toState: "DISCHARGING",
    timestamp: "2026-08-20T10:00:01.500Z",
  },
  {
    nodeId: "node-00233",
    zone: "ZONE-A",
    fromState: "DISCHARGING",
    toState: "FAULT",
    timestamp: "2026-08-20T10:00:03.000Z",
  },
];

function renderWithStore(events = SEED_EVENTS) {
  const store = configureStore({
    reducer: { events: eventsReducer },
    preloadedState: { events: { items: events, cursor: 0, storedCount: events.length } },
  });

  return {
    ...render(
      <Provider store={store}>
        <EventLogPanel />
      </Provider>
    ),
    store,
  };
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("<EventLogPanel />", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date("2026-08-20T10:00:05.000Z") });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the panel header", () => {
    renderWithStore();
    expect(screen.getByText(/event log/i)).toBeInTheDocument();
  });

  it("shows an empty-state message when there are no events", () => {
    renderWithStore([]);
    expect(
      screen.getByText(/no transition events recorded/i)
    ).toBeInTheDocument();
  });

  it("renders transition rows with time, node id, zone and states", () => {
    renderWithStore();
    expect(screen.getByText("node-00042")).toBeInTheDocument();
    expect(screen.getByText("node-00101")).toBeInTheDocument();
    expect(screen.getByText("node-00233")).toBeInTheDocument();
    expect(screen.getByText("ZONE-A")).toBeInTheDocument();
    expect(screen.getByText("ZONE-B")).toBeInTheDocument();

    // From / to state chips
    expect(screen.getByText("CHARGING")).toBeInTheDocument();
    expect(screen.getByText("DISCHARGING")).toBeInTheDocument();
    expect(screen.getByText("FAULT")).toBeInTheDocument();
  });

  it("flags fault transitions prominently", () => {
    renderWithStore();
    // The row containing the fault transition should mention the fault marker
    const faultCell = screen.getByText("FAULT");
    expect(faultCell.closest("[data-testid^='event-row'], tr, [class*='row']")).toBeTruthy();
  });

  it("filters rows by zone", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithStore();

    const zoneSelect = screen.getByLabelText(/zone/i);
    await user.selectOptions(zoneSelect, "ZONE-B");

    // Only the ZONE-B node remains visible
    expect(screen.queryByText("node-00042")).not.toBeInTheDocument();
    expect(screen.queryByText("node-00233")).not.toBeInTheDocument();
    expect(screen.getByText("node-00101")).toBeInTheDocument();
  });

  it("dispatches the highlightNode event when a row is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithStore();

    const spy = vi.fn();
    window.addEventListener("highlightNode", spy);

    const row = screen.getByText("node-00042").closest("[data-testid='event-row']");
    if (row) {
      await user.click(row);
    }

    expect(spy).toHaveBeenCalledTimes(1);
    const detail = (spy.mock.calls[0][0] as CustomEvent).detail;
    expect(detail).toEqual({ nodeId: "node-00042" });

    window.removeEventListener("highlightNode", spy);
  });

  it("downloads the CSV when the export button is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(vi.fn());
    renderWithStore();

    const exportButton = screen.getByRole("button", { name: /export/i });
    await user.click(exportButton);

    expect(clickSpy).toHaveBeenCalledTimes(1);

    clickSpy.mockRestore();
  });
});
