import React from 'react';
import { Typography, Row, Col } from 'antd';
import './Summary.css'; // 引入样式文件

const Summary = () => {
    return (
        <div className="summary-container">
            {/* 总结内容 */}
            <Row>
                <Col span={24}>
                    <Typography.Paragraph className="summary-text">
                        以上是简要的培育模型的特别的功能可以帮助您获得获得较高的模型服务体验；再一次致谢“感谢您们对于极明科技的服务的支持我将秉承信念：以打造优秀高效的服务环境和现阶段免费的服务提供，谢谢您们的青睐与使用模型会不断完善”。{' '}
                        <img src="../../static/images/emoji.png" alt="Emoji" className="summary-emoji" /> {/* 嵌入表情包 */}
                    </Typography.Paragraph>
                </Col>
            </Row>

            {/* 添加玫瑰花图标标题 */}
            <Row>
                <Col span={24}>
                    <Typography.Title level={3} className="summary-title-with-rose">
                        <img src="src\\static\\images\\flower.gif" alt="Rose" className="summary-rose-icon" />
                        总结
                    </Typography.Title>
                </Col>
            </Row>

            {/* 烟花特效 */}
            .summary-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('../../static/images/fireworks.gif'); /* 修改为实际的烟花gif地址，确保文件存在 */
                background-size: cover;
                animation: fireworks-animation 5s infinite;
            }
        </div>
    );
};

export default Summary;