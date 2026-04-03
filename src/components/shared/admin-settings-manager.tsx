"use client";

import Image from "next/image";
import { Camera, Mail, Phone, User as UserIcon, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateProfile } from "@/services/user/update-profile";
import { changePassword } from "@/services/auth/change-password";

type AdminSettingsManagerProps = {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    profileImage?: string | null;
    phoneNumber?: string | null;
    role?: string | null;
  };
};

export default function AdminSettingsManager({
  user,
}: AdminSettingsManagerProps) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");

  // Image state
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.profileImage || null,
  );

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isUpdatingProfile, startUpdateProfile] = useTransition();
  const [isChangingPassword, startChangePassword] = useTransition();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);

    if (profileImageFile) {
      formData.append("profileImage", profileImageFile);
    }

    startUpdateProfile(async () => {
      try {
        const res = await updateProfile(null, formData);
        if (res?.success) {
          toast.success(res.message || "Profile updated successfully.");
        } else {
          toast.error(res?.message || "Failed to update profile.");
        }
      } catch (error) {
        console.error("Update profile error:", error);
        toast.error("Something went wrong while updating your profile.");
      }
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("oldPassword", oldPassword);
    formData.append("newPassword", newPassword);
    formData.append("confirmNewPassword", confirmNewPassword);

    startChangePassword(async () => {
      try {
        const res = await changePassword(formData);
        if (res?.success) {
          toast.success(res.message || "Password updated successfully.");
          setOldPassword("");
          setNewPassword("");
          setConfirmNewPassword("");
        } else {
          toast.error(res?.message || "Failed to update password.");
        }
      } catch (error) {
        console.error("Password change error:", error);
        toast.error("Something went wrong while updating your password.");
      }
    });
  };

  const fullUserName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin User";
  const userRole = user.role || "Admin";

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      {/* Left Column: Profile Card */}
      <div className="space-y-6">
        <section className="relative rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(95,76,55,0.25)]">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="relative h-44 w-44 overflow-hidden rounded-full border-4 border-white bg-primary/10 shadow-xl">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={fullUserName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-primary">
                    {fullUserName.charAt(0)}
                  </div>
                )}
              </div>
              <input
                type="file"
                id="profile-image-input"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <label
                htmlFor="profile-image-input"
                className="absolute bottom-2 right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-foreground shadow-lg transition hover:bg-primary/5 active:scale-95"
              >
                <Camera className="h-4.5 w-4.5" />
              </label>
            </div>

            {profileImageFile && (
              <button
                onClick={handleDetailsSubmit}
                disabled={isUpdatingProfile}
                className=" h-9 items-center justify-center rounded-full bg-primary px-5 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-primary/80 active:scale-95 disabled:opacity-70 mb-2"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : null}
                Save Photo
              </button>
            )}
            <h2 className="text-2xl font-bold text-primary">{fullUserName}</h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {userRole}
            </p>

            <div className="mt-10 w-full space-y-5 text-left">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-foreground/80">
                Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Name
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {fullUserName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Email
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {user.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Tel:
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {user.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Setting Forms */}
      <div className="space-y-6">
        <section className="rounded-[2.5rem] border border-black/5 bg-white p-8 shadow-[0_20px_50px_-30px_rgba(95,76,55,0.25)]">
          <h2 className="text-xl font-bold text-foreground">User Settings</h2>

          <div className="mt-8 space-y-8">
            {/* Personal Details */}
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/70">
                Details
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2.5">
                  <label className="px-1 text-xs font-bold text-muted-foreground">
                    Name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="h-12 rounded-2xl border-none bg-gray-100/80 px-5 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="px-1 text-xs font-bold text-muted-foreground">
                    Last Name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="h-12 rounded-2xl border-none bg-gray-100/80 px-5 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="px-1 text-xs font-bold text-muted-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="h-12 rounded-2xl border-none bg-gray-100/80 px-5 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="px-1 text-xs font-bold text-muted-foreground">
                    Tel - Number:
                  </label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="h-12 rounded-2xl border-none bg-gray-100/80 px-5 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-lg transition hover:bg-primary/80 active:scale-95 disabled:opacity-70"
              >
                {isUpdatingProfile ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save changes
              </button>
            </form>

            <div className="h-px w-full bg-black/5" />

            {/* Password Section */}
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/70">
                Password
              </h3>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2.5">
                  <label className="px-1 text-xs font-bold text-muted-foreground">
                    Old password
                  </label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Your Password"
                    className="h-12 rounded-2xl border-none bg-gray-100/80 px-5 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="px-1 text-xs font-bold text-muted-foreground">
                    Confirm password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    className="h-12 rounded-2xl border-none bg-gray-100/80 px-5 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="px-1 text-xs font-bold text-muted-foreground">
                    New password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="h-12 rounded-2xl border-none bg-gray-100/80 px-5 focus-visible:ring-primary/20"
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="px-1 text-xs font-bold text-muted-foreground">
                    Confirm new password
                  </label>
                  <Input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-12 rounded-2xl border-none bg-gray-100/80 px-5 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-bold text-white shadow-lg transition hover:bg-primary/80 active:scale-95 disabled:opacity-70"
              >
                {isChangingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save changes
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
