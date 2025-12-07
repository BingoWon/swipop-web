"use client";

import {
    Avatar,
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Divider,
    Input,
    ScrollShadow,
    Spinner,
    Tab,
    Tabs,
    Textarea,
    Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

/**
 * Design System / Component Showcase Page
 * Displays all UI components and their variants like Figma
 */
export default function DesignSystemPage() {
    return (
        <SidebarLayout>
            <div className="space-y-12">
                <header>
                    <h1 className="text-3xl font-bold mb-2">Design System</h1>
                    <p className="text-default-500">
                        All UI components and variants used in Swipop
                    </p>
                </header>

                {/* Buttons Section */}
                <ComponentSection title="Buttons" icon="solar:cursor-bold">
                    <div className="space-y-6">
                        {/* Button Colors */}
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Colors
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                <Button color="default">Default</Button>
                                <Button color="primary">Primary</Button>
                                <Button color="secondary">Secondary</Button>
                                <Button color="success">Success</Button>
                                <Button color="warning">Warning</Button>
                                <Button color="danger">Danger</Button>
                            </div>
                        </div>

                        {/* Button Variants */}
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Variants
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                <Button variant="solid" color="primary">
                                    Solid
                                </Button>
                                <Button variant="bordered" color="primary">
                                    Bordered
                                </Button>
                                <Button variant="light" color="primary">
                                    Light
                                </Button>
                                <Button variant="flat" color="primary">
                                    Flat
                                </Button>
                                <Button variant="faded" color="primary">
                                    Faded
                                </Button>
                                <Button variant="shadow" color="primary">
                                    Shadow
                                </Button>
                                <Button variant="ghost" color="primary">
                                    Ghost
                                </Button>
                            </div>
                        </div>

                        {/* Button Sizes */}
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Sizes
                            </h4>
                            <div className="flex flex-wrap items-center gap-3">
                                <Button size="sm" color="primary">
                                    Small
                                </Button>
                                <Button size="md" color="primary">
                                    Medium
                                </Button>
                                <Button size="lg" color="primary">
                                    Large
                                </Button>
                            </div>
                        </div>

                        {/* Buttons with Icons */}
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                With Icons
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    color="primary"
                                    startContent={<Icon icon="solar:add-circle-bold" />}
                                >
                                    Start Icon
                                </Button>
                                <Button
                                    color="primary"
                                    endContent={<Icon icon="solar:arrow-right-bold" />}
                                >
                                    End Icon
                                </Button>
                                <Button color="primary" isIconOnly>
                                    <Icon icon="solar:heart-bold" />
                                </Button>
                                <Button
                                    color="success"
                                    startContent={<Icon icon="solar:cloud-check-bold" />}
                                >
                                    Saved
                                </Button>
                                <Button
                                    color="primary"
                                    startContent={<Icon icon="solar:upload-bold" />}
                                >
                                    Publish
                                </Button>
                            </div>
                        </div>

                        {/* Button States */}
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                States
                            </h4>
                            <div className="flex flex-wrap gap-3">
                                <Button color="primary" isDisabled>
                                    Disabled
                                </Button>
                                <Button color="primary" isLoading>
                                    Loading
                                </Button>
                            </div>
                        </div>
                    </div>
                </ComponentSection>

                <Divider />

                {/* Inputs Section */}
                <ComponentSection title="Inputs" icon="solar:text-field-bold">
                    <div className="space-y-6 max-w-md">
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Variants
                            </h4>
                            <div className="space-y-3">
                                <Input placeholder="Flat (default)" variant="flat" />
                                <Input placeholder="Bordered" variant="bordered" />
                                <Input placeholder="Underlined" variant="underlined" />
                                <Input placeholder="Faded" variant="faded" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                With Label & Description
                            </h4>
                            <Input
                                label="Email"
                                placeholder="Enter your email"
                                description="We'll never share your email"
                                type="email"
                            />
                        </div>

                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Textarea
                            </h4>
                            <Textarea
                                placeholder="Write something..."
                                label="Description"
                                minRows={3}
                            />
                        </div>
                    </div>
                </ComponentSection>

                <Divider />

                {/* Avatars Section */}
                <ComponentSection title="Avatars" icon="solar:user-circle-bold">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Sizes
                            </h4>
                            <div className="flex items-center gap-4">
                                <Avatar size="sm" name="S" />
                                <Avatar size="md" name="M" />
                                <Avatar size="lg" name="L" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                With Images
                            </h4>
                            <div className="flex items-center gap-4">
                                <Avatar
                                    src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                                    size="md"
                                />
                                <Avatar
                                    src="https://i.pravatar.cc/150?u=a04258114e29026708c"
                                    size="md"
                                />
                                <Avatar
                                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                                    size="md"
                                />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Fallback
                            </h4>
                            <div className="flex items-center gap-4">
                                <Avatar showFallback name="John Doe" size="md" />
                                <Avatar showFallback name="U" size="md" className="bg-primary" />
                            </div>
                        </div>
                    </div>
                </ComponentSection>

                <Divider />

                {/* Chips Section */}
                <ComponentSection title="Chips" icon="solar:tag-bold">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Colors
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <Chip color="default">Default</Chip>
                                <Chip color="primary">Primary</Chip>
                                <Chip color="secondary">Secondary</Chip>
                                <Chip color="success">Success</Chip>
                                <Chip color="warning">Warning</Chip>
                                <Chip color="danger">Danger</Chip>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Variants
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <Chip variant="solid" color="primary">
                                    Solid
                                </Chip>
                                <Chip variant="bordered" color="primary">
                                    Bordered
                                </Chip>
                                <Chip variant="light" color="primary">
                                    Light
                                </Chip>
                                <Chip variant="flat" color="primary">
                                    Flat
                                </Chip>
                                <Chip variant="faded" color="primary">
                                    Faded
                                </Chip>
                                <Chip variant="shadow" color="primary">
                                    Shadow
                                </Chip>
                                <Chip variant="dot" color="primary">
                                    Dot
                                </Chip>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                With Icons / Closeable
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                <Chip
                                    startContent={<Icon icon="solar:hashtag-bold" />}
                                    variant="flat"
                                >
                                    #javascript
                                </Chip>
                                <Chip
                                    startContent={<Icon icon="solar:hashtag-bold" />}
                                    variant="flat"
                                >
                                    #react
                                </Chip>
                                <Chip onClose={() => { }} variant="flat">
                                    Closeable
                                </Chip>
                            </div>
                        </div>
                    </div>
                </ComponentSection>

                <Divider />

                {/* Cards Section */}
                <ComponentSection title="Cards" icon="solar:card-bold">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <h4 className="font-medium">Basic Card</h4>
                            </CardHeader>
                            <CardBody>
                                <p className="text-default-500 text-small">
                                    This is a basic card with header and body.
                                </p>
                            </CardBody>
                        </Card>

                        <Card isHoverable isPressable>
                            <CardBody>
                                <p className="text-small">Hoverable & Pressable Card</p>
                            </CardBody>
                        </Card>

                        <Card className="bg-primary text-primary-foreground">
                            <CardBody>
                                <p className="text-small">Colored Card</p>
                            </CardBody>
                        </Card>
                    </div>
                </ComponentSection>

                <Divider />

                {/* Tabs Section */}
                <ComponentSection title="Tabs" icon="solar:list-bold">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Default
                            </h4>
                            <Tabs>
                                <Tab key="html" title="HTML" />
                                <Tab key="css" title="CSS" />
                                <Tab key="js" title="JavaScript" />
                            </Tabs>
                        </div>

                        <div>
                            <h4 className="text-small font-medium text-default-500 mb-3">
                                Variants
                            </h4>
                            <div className="space-y-3">
                                <Tabs variant="solid">
                                    <Tab key="1" title="Solid" />
                                    <Tab key="2" title="Tab 2" />
                                </Tabs>
                                <Tabs variant="bordered">
                                    <Tab key="1" title="Bordered" />
                                    <Tab key="2" title="Tab 2" />
                                </Tabs>
                                <Tabs variant="light">
                                    <Tab key="1" title="Light" />
                                    <Tab key="2" title="Tab 2" />
                                </Tabs>
                                <Tabs variant="underlined">
                                    <Tab key="1" title="Underlined" />
                                    <Tab key="2" title="Tab 2" />
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </ComponentSection>

                <Divider />

                {/* Spinner Section */}
                <ComponentSection title="Spinners" icon="solar:refresh-bold">
                    <div className="flex items-center gap-6">
                        <Spinner size="sm" />
                        <Spinner size="md" />
                        <Spinner size="lg" />
                        <Spinner color="primary" size="lg" />
                        <Spinner color="success" size="lg" />
                    </div>
                </ComponentSection>

                <Divider />

                {/* Tooltips Section */}
                <ComponentSection title="Tooltips" icon="solar:chat-square-bold">
                    <div className="flex flex-wrap gap-4">
                        <Tooltip content="Default tooltip">
                            <Button variant="flat">Hover me</Button>
                        </Tooltip>
                        <Tooltip content="Top placement" placement="top">
                            <Button variant="flat">Top</Button>
                        </Tooltip>
                        <Tooltip content="Bottom placement" placement="bottom">
                            <Button variant="flat">Bottom</Button>
                        </Tooltip>
                        <Tooltip content="Left placement" placement="left">
                            <Button variant="flat">Left</Button>
                        </Tooltip>
                        <Tooltip content="Right placement" placement="right">
                            <Button variant="flat">Right</Button>
                        </Tooltip>
                    </div>
                </ComponentSection>

                <Divider />

                {/* Icons Section */}
                <ComponentSection title="Icons (Solar)" icon="solar:star-bold">
                    <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
                        {[
                            "solar:home-2-bold",
                            "solar:heart-bold",
                            "solar:heart-linear",
                            "solar:bookmark-bold",
                            "solar:bookmark-linear",
                            "solar:chat-round-dots-bold",
                            "solar:eye-bold",
                            "solar:share-bold",
                            "solar:user-bold",
                            "solar:settings-bold",
                            "solar:magnifer-bold",
                            "solar:bell-bold",
                            "solar:code-bold",
                            "solar:magic-stick-3-bold",
                            "solar:upload-bold",
                            "solar:cloud-check-bold",
                            "solar:pen-bold",
                            "solar:trash-bin-bold",
                            "solar:add-circle-bold",
                            "solar:arrow-right-bold",
                            "solar:arrow-left-bold",
                            "solar:arrow-up-bold",
                            "solar:arrow-down-bold",
                            "solar:logout-2-bold",
                        ].map((icon) => (
                            <Tooltip key={icon} content={icon}>
                                <div className="flex items-center justify-center p-3 rounded-lg bg-content2 hover:bg-content3 transition-colors cursor-pointer">
                                    <Icon icon={icon} className="text-2xl" />
                                </div>
                            </Tooltip>
                        ))}
                    </div>
                </ComponentSection>

                <Divider />

                {/* Color Palette Section */}
                <ComponentSection title="Color Palette" icon="solar:palette-bold">
                    <div className="space-y-4">
                        {[
                            { name: "Primary", colors: "bg-primary" },
                            { name: "Secondary", colors: "bg-secondary" },
                            { name: "Success", colors: "bg-success" },
                            { name: "Warning", colors: "bg-warning" },
                            { name: "Danger", colors: "bg-danger" },
                            { name: "Default", colors: "bg-default" },
                            { name: "Content1", colors: "bg-content1 border" },
                            { name: "Content2", colors: "bg-content2 border" },
                            { name: "Content3", colors: "bg-content3 border" },
                        ].map((color) => (
                            <div key={color.name} className="flex items-center gap-4">
                                <div
                                    className={`w-12 h-12 rounded-lg ${color.colors} border-divider`}
                                />
                                <span className="text-small font-medium">{color.name}</span>
                            </div>
                        ))}
                    </div>
                </ComponentSection>
            </div>
        </SidebarLayout>
    );
}

function ComponentSection({
    title,
    icon,
    children,
}: {
    title: string;
    icon: string;
    children: React.ReactNode;
}) {
    return (
        <section>
            <div className="flex items-center gap-2 mb-4">
                <Icon icon={icon} className="text-xl text-primary" />
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            {children}
        </section>
    );
}
