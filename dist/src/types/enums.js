"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.InvitationStatus = exports.SubscriptionStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "owner";
    UserRole["ADMIN"] = "admin";
    UserRole["DOCTOR"] = "doctor";
})(UserRole || (exports.UserRole = UserRole = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["INACTIVE"] = "inactive";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "pending";
    InvitationStatus["ACCEPTED"] = "accepted";
    InvitationStatus["EXPIRED"] = "expired";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING_VERIFICATION"] = "pending_verification";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
//# sourceMappingURL=enums.js.map