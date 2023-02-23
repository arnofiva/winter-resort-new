import { isAbortError } from "@arcgis/core/core/promiseUtils";
import { MeasurementSystem } from "@arcgis/core/core/units";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Portal from "@arcgis/core/portal/Portal";
import SceneView from "@arcgis/core/views/SceneView";
import DefaultUI from "@arcgis/core/views/ui/DefaultUI";
import WebScene from "@arcgis/core/WebScene";

/**
 * Suppress errors about uncaught abort errors in promises, for cases where we expect them to be thrown.
 */
export async function ignoreAbortErrors<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error: any) {
    if (!isAbortError(error)) {
      throw error;
    }
    return undefined;
  }
}

export function abortNullable<T extends { abort: () => void }>(obj: T | null): null {
  if (obj) {
    obj.abort();
  }
  return null;
}

export function removeNullable<T extends { remove: () => void }>(obj: T | null): null {
  if (obj) {
    obj.remove();
  }
  return null;
}

export function getDefaultMeasurementSystem(view: SceneView): MeasurementSystem {
  const scene = view.map as WebScene;
  const portal = (scene && "portalItem" in scene ? scene.portalItem?.portal : null) ?? Portal.getDefault();
  const units = portal.user?.units ?? portal.units;
  return units === "english" ? "imperial" : "metric";
}

/**
 * Set a new definition expression on a layer, combining it with any existing expression if one exists.
 */
export function appendDefinitionExpression(layer: FeatureLayer, operator: "AND" | "OR", expression: string): void {
  layer.definitionExpression = layer.definitionExpression
    ? `(${layer.definitionExpression}) ${operator} ${expression}`
    : expression;
}

/**
 * Finds an element in the view UI that can be used as a container for a widget.
 * @param position The position of the element in the view UI
 * @param widgetId A unique id specific to the component being added
 */
export function ensureViewUIContainer(
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right",
  widgetId: string
): HTMLElement {
  widgetId += "-ui-container"; // avoid conflicts with other ids used for CSS
  let widgetContainerEl = document.getElementById(widgetId);
  if (!widgetContainerEl) {
    widgetContainerEl = document.createElement("div");
    widgetContainerEl.id = widgetId;
    viewUI.add(widgetContainerEl, position);
  }
  return widgetContainerEl;
}

/**
 * For use in findViewUIContainer.
 */
let viewUI: DefaultUI;
export function setViewUI(ui: DefaultUI): void {
  viewUI = ui;
}

export function dateToTimeString(date: Date): { hoursMinutes: string; seconds: string } {
  const timeParts = formatter.formatToParts(date).map((part) => part.value);
  const hoursMinutes = timeParts.slice(0, 3).join("");
  const seconds = timeParts.slice(3, 5).join("");
  return { hoursMinutes, seconds };
}

const formatter = new Intl.DateTimeFormat("en-US", {
  timeStyle: "medium",
  timeZone: "UTC",
  hour12: false
});
