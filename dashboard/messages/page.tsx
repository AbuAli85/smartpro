import { Suspense } from "react";
import {MessageList} from '../../../components/dashboard/message-list';
import { LoadingState } from "@/components/ui/loading-state";

export default function MessagesPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Messages</h1>
      <Suspense fallback={<LoadingState />}>
        <MessageList />
      </Suspense>
    </div>
  );
}
