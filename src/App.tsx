import { NotificationProvider } from "./shared/notification";
import { ModalProvider } from "./shared/modal";
import { MessageProvider } from "./shared/message";
import ButtonDemo from "./shared/button/ButtonDemo";
import BadgeDemo from "./shared/badge/BadgeDemo";
import MessageDemo from "./shared/message/MessageDemo";
import TreeViewDemo from "./shared/tree-view/TreeViewDemo";
import ModalDemo from "./shared/modal/ModalDemo";
import NotificationDemo from "./shared/notification/NotificationDemo";

function App() {
  return (
    <NotificationProvider>
      <ModalProvider>
        <MessageProvider>
          <div className="flex flex-col gap-8 p-8">
            <ButtonDemo />
            <hr className="border-border" />
            <BadgeDemo />
            <hr className="border-border" />
            <MessageDemo />
            <hr className="border-border" />
            <TreeViewDemo />
            <hr className="border-border" />
            <ModalDemo />
            <hr className="border-border" />
            <NotificationDemo />
          </div>
        </MessageProvider>
      </ModalProvider>
    </NotificationProvider>
  );
}

export default App;
