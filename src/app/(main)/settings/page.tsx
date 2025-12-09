"use client";

import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import React from "react";
import { PageLoading } from "@/components/ui/LoadingState";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * Settings page - Account info and Danger Zone
 */
export default function SettingsPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const logoutModal = useDisclosure();
    const deleteModal = useDisclosure();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    if (loading) {
        return <PageLoading />;
    }

    if (!user) {
        router.push("/login");
        return null;
    }

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await signOut();
        logoutModal.onClose();
        router.push("/");
    };

    const provider = user.app_metadata?.provider || "email";
    const providerIcon = {
        google: "flat-color-icons:google",
        apple: "ic:baseline-apple",
        github: "mdi:github",
        email: "solar:letter-bold",
    }[provider] || "solar:user-bold";

    const providerName = {
        google: "Google",
        apple: "Apple",
        github: "GitHub",
        email: "Email",
    }[provider] || provider;

    return (
        <>
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold">Settings</h1>

                <Card>
                    <CardHeader className="flex gap-3">
                        <Icon icon="solar:user-circle-bold" className="text-2xl text-primary" />
                        <div className="flex flex-col">
                            <p className="text-md font-semibold">Account</p>
                            <p className="text-small text-default-500">Your account information</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="solar:letter-bold" className="text-xl text-default-400" />
                                <div>
                                    <p className="text-small text-default-500">Email</p>
                                    <p className="font-medium">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon={providerIcon} className="text-xl" />
                                <div>
                                    <p className="text-small text-default-500">Sign in method</p>
                                    <p className="font-medium">{providerName}</p>
                                </div>
                            </div>
                            <Chip size="sm" variant="flat" color="success">Connected</Chip>
                        </div>
                    </CardBody>
                </Card>

                <Card className="border-danger/50">
                    <CardHeader className="flex gap-3">
                        <Icon icon="solar:danger-triangle-bold" className="text-2xl text-danger" />
                        <div className="flex flex-col">
                            <p className="text-md font-semibold text-danger">Danger Zone</p>
                            <p className="text-small text-default-500">Irreversible actions</p>
                        </div>
                    </CardHeader>
                    <Divider />
                    <CardBody className="gap-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Sign Out</p>
                                <p className="text-small text-default-500">Sign out of your account on this device</p>
                            </div>
                            <Button
                                color="default"
                                variant="bordered"
                                startContent={<Icon icon="solar:logout-2-bold" />}
                                onPress={logoutModal.onOpen}
                            >
                                Sign Out
                            </Button>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Delete Account</p>
                                <p className="text-small text-default-500">Permanently delete your account and all data</p>
                            </div>
                            <Button
                                color="danger"
                                variant="flat"
                                startContent={<Icon icon="solar:trash-bin-trash-bold" />}
                                onPress={deleteModal.onOpen}
                            >
                                Delete
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            </div>

            <Modal isOpen={logoutModal.isOpen} onClose={logoutModal.onClose}>
                <ModalContent>
                    <ModalHeader>Sign Out</ModalHeader>
                    <ModalBody>
                        <p>Are you sure you want to sign out?</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={logoutModal.onClose}>Cancel</Button>
                        <Button color="danger" onPress={handleLogout} isLoading={isLoggingOut}>
                            Sign Out
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
                <ModalContent>
                    <ModalHeader className="text-danger">Delete Account</ModalHeader>
                    <ModalBody>
                        <p>This action is <strong>irreversible</strong>. All your data including projects, likes, and comments will be permanently deleted.</p>
                        <p className="text-small text-default-500 mt-2">If you're sure, please contact support to proceed with account deletion.</p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={deleteModal.onClose}>Cancel</Button>
                        <Button color="danger" as="a" href="mailto:support@swipop.app?subject=Delete%20Account%20Request">
                            Contact Support
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
