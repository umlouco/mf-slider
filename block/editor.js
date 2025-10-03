(function (wp) {
    const { registerBlockType } = wp.blocks;
    const { MediaUpload, InspectorControls } = wp.blockEditor || wp.editor;
    const ServerSideRender = wp.serverSideRender;
    const { PanelBody, ToggleControl, SelectControl, Button, Placeholder, Notice } = wp.components;
    const { __experimentalGetSettings, getSettings } = wp.date || {};
    const el = wp.element.createElement;
    const Fragment = wp.element.Fragment;

    const IMAGE_SIZE_OPTIONS = [
        'thumbnail', 'medium', 'medium_large', 'large', 'full'
    ].map(s => ({ label: s, value: s }));

    registerBlockType('wpls/light-slider', {
        edit: (props) => {
            const { attributes, setAttributes } = props;
            const { ids, size, thumbSize, captions } = attributes;

            const onSelectImages = (media) => {
                const selected = (media || []).map(m => m.id).filter(Boolean);
                setAttributes({ ids: selected });
            };

            return el(Fragment, {},
                el(InspectorControls, {},
                    el(PanelBody, { title: 'Settings', initialOpen: true },
                        el(SelectControl, {
                            label: 'Full image size',
                            value: size,
                            options: IMAGE_SIZE_OPTIONS,
                            onChange: (val) => setAttributes({ size: val })
                        }),
                        el(SelectControl, {
                            label: 'Thumbnail size',
                            value: thumbSize,
                            options: IMAGE_SIZE_OPTIONS,
                            onChange: (val) => setAttributes({ thumbSize: val })
                        }),
                        el(ToggleControl, {
                            label: 'Show captions',
                            checked: captions,
                            onChange: (val) => setAttributes({ captions: val })
                        })
                    )
                ),
                ids && ids.length
                    ? el(ServerSideRender, {
                        block: 'wpls/light-slider',
                        attributes: attributes
                    })
                    : el('div', { className: 'wpls-block-placeholder' },
                        el(Placeholder, {
                            label: 'MF Slider',
                            instructions: 'Select images to include in the slider.'
                        },
                            el(MediaUpload, {
                                onSelect: onSelectImages,
                                allowedTypes: ['image'],
                                multiple: true,
                                gallery: true,
                                value: ids,
                                render: ({ open }) => el(Button, { variant: 'primary', onClick: open }, 'Select Images')
                            })
                        )
                    )
            );
        },
        save: () => null // dynamic render in PHP
    });

    // Since the front-end is rendered via PHP, nothing else is required here.
})(window.wp);
