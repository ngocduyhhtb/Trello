import React, { useState, useEffect, useRef } from "react";
import { cloneDeep } from "lodash";
import { Container, Draggable } from "react-smooth-dnd";
import "./Column.scss";
import Card from "components/Card/Card";
import { mapOrder } from "utilities/sorts";
import { Dropdown, Form, Button } from "react-bootstrap";
import ConfirmModal from "components/Common/ConfirmModal";
import { MODAL_ACTION_CONFIRM, MODAL_ACTION_CLOSE } from "utilities/constants";
import {
  saveContentPressEnter,
  selectAllInlineText,
} from "utilities/contentEditable";
const Column = ({ column, onCardDrop, onUpdateColumn }) => {
  //State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [columnTitle, setColumnTitle] = useState("");
  const [openNewCardForm, setOpenNewCardForm] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  //Ref
  const newCardTextareaRef = useRef(null);
  //Effect
  useEffect(() => {
    setColumnTitle(column.title);
  }, [column.title]);
  useEffect(() => {
    if (newCardTextareaRef && newCardTextareaRef.current) {
      newCardTextareaRef.current.focus();
      newCardTextareaRef.current.select();
    }
  }, [openNewCardForm]);
  //Function
  const onNewCardTitleChange = (e) => setNewCardTitle(e.target.value);
  const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm);
  const cards = mapOrder(column.cards, column.cardOrder, "id");
  const toggleConfirmModal = () => setShowConfirmModal(!showConfirmModal);
  const onConfirmModalAction = (type) => {
    if (type === MODAL_ACTION_CONFIRM) {
      const newColumn = {
        ...column,
        _destroy: true,
      };
      onUpdateColumn(newColumn);
    }
    toggleConfirmModal();
  };

  const handleColumnTitleChange = (e) => setColumnTitle(e.target.value);
  const handleColumnTitleBlur = () => {
    const newColumn = {
      ...column,
      title: columnTitle,
    };
    onUpdateColumn(newColumn);
  };
  const addNewCard = () => {
    if (!newCardTitle) {
      newCardTextareaRef.current.focus();
      return;
    }
    const newCardToAdd = {
      id: Math.random().toString(36).substr(2, 5),
      boardId: column.boardId,
      columnId: column.id,
      title: newCardTitle.trim(),
      cover: null,
    };
    let newColumn = cloneDeep(column);
    newColumn.cards.push(newCardToAdd);
    newColumn.cardOrder.push(newCardToAdd.id);
    onUpdateColumn(newColumn);
    setNewCardTitle("");
    toggleOpenNewCardForm();
  };
  return (
    <div className="column">
      <header className="column-drag-handle">
        <div className="column-title">
          <Form.Control
            size="sm"
            type="text"
            className="trello-content-editable"
            value={columnTitle}
            spellCheck="false"
            onClick={selectAllInlineText}
            onChange={handleColumnTitleChange}
            onBlur={handleColumnTitleBlur}
            onKeyDown={saveContentPressEnter}
            onMouseDown={(e) => e.preventDefault()}
          ></Form.Control>
        </div>
        <div className="column-dropdown-actions">
          <Dropdown>
            <Dropdown.Toggle
              id="dropdown-basic"
              size="sm"
              className="dropdown-btn"
            />
            <Dropdown.Menu>
              <Dropdown.Item>Add card</Dropdown.Item>
              <Dropdown.Item onClick={toggleConfirmModal}>
                Remove column
              </Dropdown.Item>
              <Dropdown.Item>
                Move all card in this column (beta)...
              </Dropdown.Item>
              <Dropdown.Item>
                Archive all cards in this column (beta)...
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
      <div className="card-list">
        <Container
          {...column.props}
          groupName="col"
          onDrop={(dropResult) => onCardDrop(column.id, dropResult)}
          getChildPayload={(index) => cards[index]}
          dragClass="card-ghost"
          dropClass="card-ghost-drop"
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: "card-drop-preview",
          }}
          dropPlaceholderAnimationDuration={200}
        >
          {cards.map((card, index) => (
            <Draggable key={index}>
              <Card card={card} />
            </Draggable>
          ))}
        </Container>
        {openNewCardForm && (
          <div className="add-new-card-area">
            <Form.Control
              size="sm"
              as="textarea"
              rows="3"
              placeholder="Enter card title..."
              className="textarea-enter-new-card"
              ref={newCardTextareaRef}
              value={newCardTitle}
              onChange={onNewCardTitleChange}
              onKeyDown={(event) => event.key === "Enter" && addNewCard}
            ></Form.Control>
          </div>
        )}
      </div>
      <footer>
        {openNewCardForm && (
          <div className="add-item-control">
            <Button variant="success" size="sm" onClick={addNewCard}>
              Add card
            </Button>{" "}
            <span className="cancel-icon" onClick={toggleOpenNewCardForm}>
              <i className="fa fa-times icon"></i>
            </span>
          </div>
        )}
        {!openNewCardForm && (
          <div className="footer-actions" onClick={toggleOpenNewCardForm}>
            <i className="fa fa-plus icon" />
            Add another card
          </div>
        )}
      </footer>
      <ConfirmModal
        show={showConfirmModal}
        onAction={onConfirmModalAction}
        title="Remove column"
        content={`Are you sure you want to remove <strong>${column.title}</strong>?<br/> All related will also be removed!`}
      />
    </div>
  );
};

export default Column;
