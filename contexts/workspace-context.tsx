"use client";

import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";
import * as workspaceService from "@/services/workspace";
import type { WorkspaceWithRole } from "@/types/workspace";
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode
} from "react";

const CURRENT_WORKSPACE_KEY = "salva_contas_current_workspace";

interface WorkspaceContextValue {
  currentWorkspaceId: string | null;
  workspaces: WorkspaceWithRole[];
  isLoading: boolean;
  setCurrentWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
  currentWorkspace: WorkspaceWithRole | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export { WorkspaceContext };

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkspaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedWorkspaces = await workspaceService.getWorkspaces();
      setWorkspaces(fetchedWorkspaces);

      const storedWorkspaceId = localStorage.getItem(CURRENT_WORKSPACE_KEY);

      const pickFirst = () => {
        if (fetchedWorkspaces.length > 0) {
          const firstId = fetchedWorkspaces[0].id;
          setCurrentWorkspaceId(firstId);
          localStorage.setItem(CURRENT_WORKSPACE_KEY, firstId);
        }
      };

      if (storedWorkspaceId) {
        const exists = fetchedWorkspaces.find((w) => w.id === storedWorkspaceId);
        if (exists) {
          setCurrentWorkspaceId(storedWorkspaceId);
          apiClient.defaults.headers["x-workspace-id"] = storedWorkspaceId;
        } else {
          const byLastAccess = fetchedWorkspaces
            .filter((w) => w.lastAccessed)
            .sort((a, b) => (new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime()));

          if (byLastAccess.length > 0) {
            setCurrentWorkspaceId(byLastAccess[0].id);
            localStorage.setItem(CURRENT_WORKSPACE_KEY, byLastAccess[0].id);
            apiClient.defaults.headers["x-workspace-id"] = byLastAccess[0].id;
          } else {
            pickFirst();
          }
        }
      } else {
        const byLastAccess = fetchedWorkspaces
          .filter((w) => w.lastAccessed)
          .sort((a, b) => (new Date(b.lastAccessed!).getTime() - new Date(a.lastAccessed!).getTime()));

        if (byLastAccess.length > 0) {
          setCurrentWorkspaceId(byLastAccess[0].id);
          localStorage.setItem(CURRENT_WORKSPACE_KEY, byLastAccess[0].id);
          apiClient.defaults.headers["x-workspace-id"] = byLastAccess[0].id;
        } else {
          pickFirst();
        }
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCurrentWorkspace = useCallback((workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    localStorage.setItem(CURRENT_WORKSPACE_KEY, workspaceId);

    if (workspaceId) {
      apiClient.defaults.headers["x-workspace-id"] = workspaceId;
    } else {
      delete apiClient.defaults.headers["x-workspace-id"];
    }

    void workspaceService.touchWorkspace(workspaceId).catch((err) => {
      console.warn('Failed to record workspace access:', err);
    });
  }, []);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) ?? null;

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (currentWorkspaceId) {
          config.headers["x-workspace-id"] = currentWorkspaceId;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (currentWorkspaceId) {
      apiClient.defaults.headers["x-workspace-id"] = currentWorkspaceId;
    } else {
      delete apiClient.defaults.headers["x-workspace-id"];
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadWorkspaces();
    } else {
      setCurrentWorkspaceId(null);
      setWorkspaces([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, loadWorkspaces]);

  const value: WorkspaceContextValue = {
    currentWorkspaceId,
    workspaces,
    isLoading,
    setCurrentWorkspace,
    refreshWorkspaces: loadWorkspaces,
    currentWorkspace,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
