import React from 'react';
import { Modal, Typography } from 'antd';
import './GuideModal.css'; // 引入样式文件

const GuideModal = ({ visible, onCancel }) => {
    return (
        <Modal
            title="使用指南"
            visible={visible}
            onCancel={onCancel}
            footer={null}
            className="guide-modal"
        >
            {/* 模态框内容 */}
            <Typography.Paragraph>
                {/* ... existing code ... */}
            </Typography.Paragraph>
        </Modal>
    );
};

export default GuideModal;