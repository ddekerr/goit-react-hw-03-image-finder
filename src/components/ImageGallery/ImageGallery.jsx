import PropTypes from 'prop-types';
import galleryApi from 'services/fetchImages';

import { Component } from 'react';
import { Puff } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';

import { ImageGalleryContainer } from './ImageGallery.styled';
import { ImageGalleryItem } from './ImageGalleryItem';
import { LoadMoreButton } from 'components/LoadMoreButton/LoadMoreButton';

export class ImageGallery extends Component {
  static propTypes = {
    searchQuery: PropTypes.string.isRequired,
  };

  state = {
    images: [],
    error: null,
    status: 'idle',
    page: 1,
  };

  async componentDidUpdate(prevProps, prevState) {
    const { searchQuery } = this.props;
    const { page } = this.state;

    if (
      prevProps.searchQuery !== searchQuery ||
      prevState.page !== this.state.page
    ) {
      this.setState({ status: 'pending', images: [], page: 1 });

      const images = await galleryApi.fetchImagesByQuery(searchQuery, page);

      if (images.length > 0) {
        this.setState({
          images: this.state.images.concat(images),
          status: 'resolved',
        });
      } else {
        this.setState({
          error: 'No result by this query!',
          status: 'rejected',
        });
        toast.error('No result by this query!');
      }
    }
  }

  loadMore = () => {
    this.setState(prevState => ({ page: prevState.page + 1 }));
  };

  render() {
    const { images, status } = this.state;

    if (status === 'idle') {
      return <p>No match result yet</p>;
    }

    if (status === 'pending') {
      return <Puff color="#3f51b5" />;
    }

    if (status === 'rejected') {
      return (
        <>
          <p>{this.state.error}</p>
          <ToastContainer
            theme="light"
            pauseOnHover={false}
            autoClose={2000}
            draggable={false}
          />
        </>
      );
    }

    if (status === 'resolved') {
      return (
        <>
          <ImageGalleryContainer>
            {images.map(image => (
              <ImageGalleryItem
                key={image.id}
                image={{
                  webformatURL: image.webformatURL,
                  tags: image.tags,
                  largeImageURL: image.largeImageURL,
                }}
              ></ImageGalleryItem>
            ))}
          </ImageGalleryContainer>
          <LoadMoreButton onClick={this.loadMore} />
        </>
      );
    }
  }
}
