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
    totalImages: null,
  };

  async componentDidUpdate(prevProps, prevState) {
    const { searchQuery } = this.props;
    const { page } = this.state;

    if (prevProps.searchQuery !== searchQuery) {
      this.setState({ images: [], page: 1 });
    }

    if (
      prevProps.searchQuery !== searchQuery ||
      prevState.page !== this.state.page
    ) {
      this.setState({ status: 'pending' });

      const images = await galleryApi.fetchImagesByQuery(searchQuery, page);

      if (images.hits.length > 0) {
        this.setState({
          images: this.state.images.concat(images.hits),
          status: 'resolved',
          totalImages: images.total,
          error: null,
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
    const { images, status, totalImages } = this.state;

    return (
      <>
        {status === 'idle' && <p>No match result yet</p>}

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

        {status === 'rejected' && (
          <>
            <p>{this.state.error}</p>
            <ToastContainer
              theme="light"
              pauseOnHover={false}
              autoClose={2000}
              draggable={false}
            />
          </>
        )}

        {totalImages !== images.length && status === 'resolved' && (
          <LoadMoreButton onClick={this.loadMore} />
        )}

        {status === 'pending' && <Puff color="#3f51b5" />}
      </>
    );
  }
}
