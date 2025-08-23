# Realtime Event System

This document explains how to use the new realtime event system for the Mesmerism website.

## Overview

The realtime system has been restructured to use a single Supabase channel (`topic:message`) for all website events. The `RealtimeProvider` in the dashboard layout manages all realtime subscriptions and dispatches events to components that subscribe to specific event types.

## Event Types

The system supports the following event types:

- `CHAT_MESSAGE` - Chat message events (INSERT, UPDATE, DELETE)
- `PAYMENT_RECEIVED` - When a user receives payment
- `VOTE_CREATOR` - Creator vote events
- `VOTE_CREATED` - New vote creation events
- `USER_JOINED` - When a user joins
- `USER_LEFT` - When a user leaves
- `SYSTEM_ANNOUNCEMENT` - System-wide announcements

## Usage

### 1. Basic Event Subscription

```tsx
import { useRealtime } from "@/app/(dashboard)/realtime-provider";

function MyComponent() {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const handlePayment = (payload: any) => {
      console.log("Payment received:", payload);
      // Handle payment logic
    };

    const unsubscribePayment = subscribe("PAYMENT_RECEIVED", handlePayment);

    return () => {
      unsubscribePayment();
    };
  }, [subscribe, unsubscribe]);

  return <div>My Component</div>;
}
```

### 2. Multiple Event Subscriptions

```tsx
function VoteComponent() {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const handleVoteCreated = (payload: any) => {
      console.log("Vote created:", payload);
    };

    const handleVoteCreator = (payload: any) => {
      console.log("Vote creator event:", payload);
    };

    const unsubscribeVoteCreated = subscribe("VOTE_CREATED", handleVoteCreated);
    const unsubscribeVoteCreator = subscribe("VOTE_CREATOR", handleVoteCreator);

    return () => {
      unsubscribeVoteCreated();
      unsubscribeVoteCreator();
    };
  }, [subscribe, unsubscribe]);

  return <div>Vote Component</div>;
}
```

### 3. Using Custom Hooks

```tsx
import { useRealtimeEvent } from "@/app/(dashboard)/realtime-examples";

function NotificationComponent() {
  useRealtimeEvent("SYSTEM_ANNOUNCEMENT", (payload) => {
    // Show notification
    console.log("System announcement:", payload);
  });

  return <div>Notifications</div>;
}
```

### 4. Multiple Events with Custom Hook

```tsx
import { useRealtimeEvents } from "@/app/(dashboard)/realtime-examples";

function ActivityComponent() {
  useRealtimeEvents([
    {
      type: "USER_JOINED",
      callback: (payload) => console.log("User joined:", payload),
    },
    {
      type: "USER_LEFT",
      callback: (payload) => console.log("User left:", payload),
    },
  ]);

  return <div>Activity Feed</div>;
}
```

## Architecture

### RealtimeProvider

- Located in `app/(dashboard)/realtime-provider.tsx`
- Manages the single Supabase realtime channel
- Handles event dispatching to subscribers
- Provides `subscribe` and `unsubscribe` methods

### Event Flow

1. Supabase sends realtime events to the channel
2. `RealtimeProvider` receives events and dispatches to subscribers
3. Components subscribe to specific event types
4. Events are handled by component callbacks

### Benefits

- **Single Channel**: All events go through one connection
- **Type Safety**: TypeScript support for event types
- **Efficient**: Components only receive events they subscribe to
- **Scalable**: Easy to add new event types
- **Clean**: Separation of concerns between realtime and UI logic

## Adding New Event Types

To add a new event type:

1. Add it to the `WebsiteEvent` type in `realtime-provider.tsx`
2. Add a broadcast listener in the `RealtimeProvider`
3. Components can then subscribe to the new event type

```tsx
// In realtime-provider.tsx
export type WebsiteEvent =
  | { type: "CHAT_MESSAGE"; payload: any }
  | { type: "PAYMENT_RECEIVED"; payload: any }
  | { type: "NEW_EVENT_TYPE"; payload: any } // Add new type here

// In the RealtimeProvider useEffect
.on("broadcast", { event: "NEW_EVENT_TYPE" }, (payload) => {
  console.log("NEW_EVENT_TYPE received:", payload);
  handleEvent("NEW_EVENT_TYPE", payload);
})
```

## Migration from Old System

The old `use-realtime-chat` hook has been updated to:

- Use the new realtime context instead of direct Supabase subscription
- Only handle `CHAT_MESSAGE` events
- Maintain the same API for existing components

## Best Practices

1. **Always unsubscribe**: Use the returned unsubscribe function in useEffect cleanup
2. **Check dependencies**: Include `subscribe` and `unsubscribe` in useEffect dependencies
3. **Error handling**: Wrap event handlers in try-catch blocks
4. **Performance**: Only subscribe to events you actually need
5. **Cleanup**: Unsubscribe when components unmount or dependencies change
