import { User } from "./user.types";
import { Grind } from "./grind.types";


export type Message = {
    id: string;
    sender: User;
    receiver: User;
    grind: Grind | null;
    content: string;
    type: "general" | "invitation" | "invitation_accepted" | "invitation_rejected";
    read: boolean;
    invitationAccepted: boolean;
    invitationRejected: boolean;
    createdAt: string;
}