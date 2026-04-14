import { onRequestGet as __api_hints_js_onRequestGet } from "D:\\game devolopments\\AWURUDU_GAMES\\awurudugames\\functions\\api\\hints.js"
import { onRequestPost as __api_hints_js_onRequestPost } from "D:\\game devolopments\\AWURUDU_GAMES\\awurudugames\\functions\\api\\hints.js"
import { onRequestDelete as __api_registrations_js_onRequestDelete } from "D:\\game devolopments\\AWURUDU_GAMES\\awurudugames\\functions\\api\\registrations.js"
import { onRequestGet as __api_registrations_js_onRequestGet } from "D:\\game devolopments\\AWURUDU_GAMES\\awurudugames\\functions\\api\\registrations.js"
import { onRequestPost as __api_registrations_js_onRequestPost } from "D:\\game devolopments\\AWURUDU_GAMES\\awurudugames\\functions\\api\\registrations.js"
import { onRequestPut as __api_registrations_js_onRequestPut } from "D:\\game devolopments\\AWURUDU_GAMES\\awurudugames\\functions\\api\\registrations.js"
import { onRequestGet as __api_results_js_onRequestGet } from "D:\\game devolopments\\AWURUDU_GAMES\\awurudugames\\functions\\api\\results.js"
import { onRequestPost as __api_results_js_onRequestPost } from "D:\\game devolopments\\AWURUDU_GAMES\\awurudugames\\functions\\api\\results.js"

export const routes = [
    {
      routePath: "/api/hints",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_hints_js_onRequestGet],
    },
  {
      routePath: "/api/hints",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_hints_js_onRequestPost],
    },
  {
      routePath: "/api/registrations",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_registrations_js_onRequestDelete],
    },
  {
      routePath: "/api/registrations",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_registrations_js_onRequestGet],
    },
  {
      routePath: "/api/registrations",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_registrations_js_onRequestPost],
    },
  {
      routePath: "/api/registrations",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_registrations_js_onRequestPut],
    },
  {
      routePath: "/api/results",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_results_js_onRequestGet],
    },
  {
      routePath: "/api/results",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_results_js_onRequestPost],
    },
  ]