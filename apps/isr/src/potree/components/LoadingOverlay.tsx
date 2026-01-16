interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = "Loading..." }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        zIndex: 10,
      }}
    >
      <div style={{ color: "white", fontSize: "18px" }}>{message}</div>
    </div>
  );
}
